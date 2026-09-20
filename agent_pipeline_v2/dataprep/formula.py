"""Tableau calculated-field formula evaluator (row-level subset).

Supports the constructs that dominate the corpus (1062 formulas scanned):
  - IF / ELSEIF / ELSE / END
  - arithmetic + - * /, comparisons, AND / OR / NOT
  - row-level functions: DATEDIFF, DATEADD, DATEPART, YEAR/MONTH/DAY/...,
    NOW, TODAY, DATE, ISNULL, ZN, IFNULL, REPLACE, LEN, LEFT/RIGHT, TRIM,
    SPLIT, CONTAINS, UPPER/LOWER, ROUND, ABS, INT/FLOAT/STR, MIN/MAX (scalar)

Explicitly NOT supported (v1): table calculations (RUNNING_*, TOTAL, LOOKUP,
RANK, PERCENTILE, TIER, FREQUENCY), LOD expressions, and aggregate calls
(SUM/COUNT/...) inside formulas. UnsupportedFormulas are raised loudly —
the dataprep layer marks the field 'unsupported' instead of guessing.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any, Callable, Dict, List, Optional

__all__ = ["evaluate_formula", "UnsupportedFormula", "compile_formula"]


class UnsupportedFormula(Exception):
    """Raised when a formula uses constructs outside the supported subset."""


# ---------------------------------------------------------------------------
# Tokenizer
# ---------------------------------------------------------------------------

_TOKEN_RE = re.compile(
    r"""
    (?P<ws>\s+)
  | (?P<field>\[[^\[\]]*\])
  | (?P<number>\d+\.\d+|\.\d+|\d+)
  | (?P<squote>'(?:[^']|'')*')
  | (?P<dquote>"(?:[^"]|"")*")
  | (?P<op><>|<=|>=|[-+*/()=<>,])
  | (?P<word>[A-Za-z_][A-Za-z0-9_.]*)
  | (?P<other>.)
    """,
    re.VERBOSE,
)

_KEYWORDS = {"IF", "THEN", "ELSEIF", "ELSE", "END", "AND", "OR", "NOT", "IN", "NULL"}


@dataclass
class Token:
    kind: str
    value: str


def _tokenize(text: str) -> List[Token]:
    tokens: List[Token] = []
    for m in _TOKEN_RE.finditer(text):
        kind = m.lastgroup
        value = m.group()
        if kind == "ws":
            continue
        if kind == "other":
            raise UnsupportedFormula(f"unexpected character: {value!r} in {text!r}")
        if kind == "word" and value.upper() in _KEYWORDS:
            kind = value.upper()
        tokens.append(Token(kind, value))
    tokens.append(Token("EOF", ""))
    return tokens


# ---------------------------------------------------------------------------
# Parser → AST  (tuples: ("lit", v) ("field", name) ("call", fn, args)
#                 ("binop", op, l, r) ("unop", op, x) ("if", [(cond, val)...], else_val))
# ---------------------------------------------------------------------------

class _Parser:
    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0

    def peek(self) -> Token:
        return self.tokens[self.pos]

    def next(self) -> Token:
        tok = self.tokens[self.pos]
        self.pos += 1
        return tok

    def expect(self, kind: str) -> Token:
        tok = self.next()
        if tok.kind != kind:
            raise UnsupportedFormula(f"expected {kind}, got {tok.kind} ({tok.value!r})")
        return tok

    # expr := or_expr
    def parse_expr(self):
        return self.parse_or()

    def parse_or(self):
        node = self.parse_and()
        while self.peek().kind == "OR":
            self.next()
            node = ("binop", "OR", node, self.parse_and())
        return node

    def parse_and(self):
        node = self.parse_not()
        while self.peek().kind == "AND":
            self.next()
            node = ("binop", "AND", node, self.parse_not())
        return node

    def parse_not(self):
        if self.peek().kind == "NOT":
            self.next()
            return ("unop", "NOT", self.parse_not())
        return self.parse_comparison()

    def parse_comparison(self):
        node = self.parse_additive()
        while self.peek().kind == "op" and self.peek().value in ("=", "<>", "<", ">", "<=", ">="):
            op = self.next().value
            node = ("binop", op, node, self.parse_additive())
        return node

    def parse_additive(self):
        node = self.parse_mult()
        while self.peek().kind == "op" and self.peek().value in ("+", "-"):
            op = self.next().value
            node = ("binop", op, node, self.parse_mult())
        return node

    def parse_mult(self):
        node = self.parse_unary()
        while self.peek().kind == "op" and self.peek().value in ("*", "/"):
            op = self.next().value
            node = ("binop", op, node, self.parse_unary())
        return node

    def parse_unary(self):
        if self.peek().kind == "op" and self.peek().value == "-":
            self.next()
            return ("unop", "-", self.parse_unary())
        return self.parse_atom()

    def parse_atom(self):
        tok = self.peek()
        if tok.kind == "IF":
            return self.parse_if()
        if tok.kind == "number":
            self.next()
            return ("lit", float(tok.value) if "." in tok.value else int(tok.value))
        if tok.kind == "squote":
            self.next()
            return ("lit", tok.value[1:-1].replace("''", "'"))
        if tok.kind == "dquote":
            self.next()
            return ("lit", tok.value[1:-1].replace('""', '"'))
        if tok.kind == "field":
            self.next()
            return ("field", tok.value[1:-1])
        if tok.kind == "NULL":
            self.next()
            return ("lit", None)
        if tok.kind == "op" and tok.value == "(":
            self.next()
            node = self.parse_expr()
            self.expect("op")  # ')'
            return node
        if tok.kind == "word":
            # function call or bare boolean constant
            self.next()
            upper = tok.value.upper()
            if upper in ("TRUE", "FALSE"):
                return ("lit", upper == "TRUE")
            if self.peek().kind == "op" and self.peek().value == "(":
                self.next()
                args = []
                if not (self.peek().kind == "op" and self.peek().value == ")"):
                    args.append(self.parse_expr())
                    while self.peek().kind == "op" and self.peek().value == ",":
                        self.next()
                        args.append(self.parse_expr())
                self.expect("op")  # ')'
                return ("call", upper, args)
            raise UnsupportedFormula(f"unexpected identifier {tok.value!r}")
        raise UnsupportedFormula(f"unexpected token {tok.kind} ({tok.value!r})")

    def parse_if(self):
        self.expect("IF")
        branches = []
        cond = self.parse_expr()
        self.expect("THEN")
        branches.append((cond, self.parse_expr()))
        else_val = ("lit", None)
        while self.peek().kind == "ELSEIF":
            self.next()
            cond = self.parse_expr()
            self.expect("THEN")
            branches.append((cond, self.parse_expr()))
        if self.peek().kind == "ELSE":
            self.next()
            else_val = self.parse_expr()
        self.expect("END")
        return ("if", branches, else_val)


# ---------------------------------------------------------------------------
# Evaluator
# ---------------------------------------------------------------------------

def _to_date(v: Any) -> Optional[date]:
    if v is None:
        return None
    if isinstance(v, datetime):
        return v
    if isinstance(v, date):
        return v
    if isinstance(v, str):
        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
            try:
                return datetime.strptime(v.strip(), fmt)
            except ValueError:
                continue
    raise UnsupportedFormula(f"cannot parse as date: {v!r}")


def _num(v: Any) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, bool):
        return 1.0 if v else 0.0
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        try:
            return float(v.replace(",", ""))
        except ValueError:
            return None
    return None


def _truthy(v: Any) -> bool:
    if v is None:
        return False
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return v != 0
    if isinstance(v, str):
        return v.strip().lower() in ("true", "1", "yes")
    return bool(v)


_DATE_PARTS = {"year", "quarter", "month", "week", "day", "hour", "minute", "second",
               "dayofyear", "weekday", "iso-year", "iso-week"}


def _datediff(unit: str, a: Any, b: Any) -> Optional[float]:
    d1, d2 = _to_date(a), _to_date(b)
    if d1 is None or d2 is None:
        return None
    unit = unit.lower()
    # Tableau semantics: count of date-part boundaries crossed
    if unit == "year":
        return d2.year - d1.year
    if unit == "quarter":
        return (d2.year - d1.year) * 4 + (d2.month - 1) // 3 - (d1.month - 1) // 3
    if unit == "month":
        return (d2.year - d1.year) * 12 + (d2.month - d1.month)
    if unit == "week":
        return (d2 - d1).days // 7
    if unit == "day":
        return (d2 - d1).days
    if unit == "hour":
        return (d2 - d1).total_seconds() // 3600
    if unit == "minute":
        return (d2 - d1).total_seconds() // 60
    if unit == "second":
        return (d2 - d1).total_seconds()
    raise UnsupportedFormula(f"DATEDIFF unit {unit!r}")


def _dateadd(unit: str, n: Any, d: Any) -> Optional[date]:
    dt = _to_date(d)
    if dt is None or n is None:
        return None
    n = int(_num(n) or 0)
    unit = unit.lower()
    if unit == "year":
        return dt.replace(year=dt.year + n)
    if unit == "quarter":
        return _dateadd("month", n * 3, dt)
    if unit == "month":
        total = dt.year * 12 + (dt.month - 1) + n
        year, month = divmod(total, 12)
        day = min(dt.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28,
                           31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month])
        return dt.replace(year=year, month=month + 1, day=day)
    if unit == "week":
        return dt + timedelta(weeks=n)
    if unit == "day":
        return dt + timedelta(days=n)
    if unit == "hour":
        return dt + timedelta(hours=n)
    if unit == "minute":
        return dt + timedelta(minutes=n)
    if unit == "second":
        return dt + timedelta(seconds=n)
    raise UnsupportedFormula(f"DATEADD unit {unit!r}")


def _datepart(unit: str, d: Any) -> Optional[int]:
    dt = _to_date(d)
    if dt is None:
        return None
    unit = unit.lower()
    if unit == "year":
        return dt.year
    if unit == "quarter":
        return (dt.month - 1) // 3 + 1
    if unit == "month":
        return dt.month
    if unit == "week":
        return int(dt.strftime("%U"))
    if unit == "day":
        return dt.day
    if unit == "dayofyear":
        return dt.timetuple().tm_yday
    if unit == "weekday":
        return dt.isoweekday()
    if unit == "hour":
        return dt.hour if isinstance(dt, datetime) else 0
    if unit == "minute":
        return dt.minute if isinstance(dt, datetime) else 0
    if unit == "second":
        return dt.second if isinstance(dt, datetime) else 0
    raise UnsupportedFormula(f"DATEPART unit {unit!r}")


_UNSUPPORTED_FUNCS = {
    "RUNNING_SUM", "RUNNING_AVG", "RUNNING_MIN", "RUNNING_MAX", "RUNNING_COUNT",
    "TOTAL", "LOOKUP", "RANK", "RANK_DENSE", "RANK_UNIQUE", "RANK_MODIFIED",
    "PERCENTILE", "TIER", "FREQUENCY", "WINDOW_SUM", "WINDOW_AVG", "WINDOW_MIN",
    "WINDOW_MAX", "WINDOW_MEDIAN", "WINDOW_COUNT", "WINDOW_PERCENTILE",
    "FIRST", "LAST", "INDEX", "SIZE", "PREVIOUS_VALUE", "MODEL_QUANTILE",
    "SUM", "AVG", "COUNT", "COUNTD", "MEDIAN", "STDEV", "VAR", "ATTR",
}


def _call(fn: str, args: List[Any]) -> Any:
    if fn in _UNSUPPORTED_FUNCS:
        raise UnsupportedFormula(
            f"function {fn} is an aggregate/table-calc and is not supported in v1"
        )
    if fn == "DATEDIFF":
        return _datediff(args[0], args[1], args[2])
    if fn == "DATEADD":
        return _dateadd(args[0], args[1], args[2])
    if fn == "DATEPART":
        return _datepart(args[0], args[1])
    if fn == "DATETRUNC":
        unit = args[0].lower() if isinstance(args[0], str) else ""
        dt = _to_date(args[1])
        if dt is None:
            return None
        if unit == "year":
            return dt.replace(month=1, day=1)
        if unit == "quarter":
            return dt.replace(month=(dt.month - 1) // 3 * 3 + 1, day=1)
        if unit == "month":
            return dt.replace(day=1)
        if unit == "week":
            return dt - timedelta(days=dt.isoweekday() - 1)
        if unit == "day":
            return dt.date() if isinstance(dt, datetime) else dt
        raise UnsupportedFormula(f"DATETRUNC unit {unit!r}")
    if fn == "YEAR":
        return _datepart("year", args[0])
    if fn == "QUARTER":
        return _datepart("quarter", args[0])
    if fn == "MONTH":
        return _datepart("month", args[0])
    if fn == "DAY":
        return _datepart("day", args[0])
    if fn == "WEEK":
        return _datepart("week", args[0])
    if fn == "HOUR":
        return _datepart("hour", args[0])
    if fn == "MINUTE":
        return _datepart("minute", args[0])
    if fn == "SECOND":
        return _datepart("second", args[0])
    if fn == "NOW":
        return datetime.now()
    if fn == "TODAY":
        return date.today()
    if fn == "DATE":
        return _to_date(args[0])
    if fn == "DATETIME":
        return _to_date(args[0])
    if fn == "MAKEDATE":
        return date(int(args[0]), int(args[1]), int(args[2]))
    if fn == "ISNULL":
        return args[0] is None
    if fn == "ZN":
        return args[0] if args[0] is not None else 0
    if fn == "IFNULL":
        return args[0] if args[0] is not None else (args[1] if len(args) > 1 else None)
    if fn == "IIF":
        return args[1] if _truthy(args[0]) else (args[2] if len(args) > 2 else None)
    if fn == "REPLACE":
        return str(args[0]).replace(str(args[1]), str(args[2])) if args[0] is not None else None
    if fn == "LEN":
        return len(str(args[0])) if args[0] is not None else 0
    if fn == "LEFT":
        return str(args[0])[: int(args[1])] if args[0] is not None else None
    if fn == "RIGHT":
        return str(args[0])[-int(args[1]):] if args[0] is not None else None
    if fn == "MID":
        start = int(args[1])
        return str(args[0])[start - 1: start - 1 + int(args[2])] if args[0] is not None else None
    if fn == "TRIM":
        return str(args[0]).strip() if args[0] is not None else None
    if fn == "LTRIM":
        return str(args[0]).lstrip() if args[0] is not None else None
    if fn == "RTRIM":
        return str(args[0]).rstrip() if args[0] is not None else None
    if fn == "SPLIT":
        parts = str(args[0]).split(str(args[1]))
        idx = int(args[2])
        if 1 <= idx <= len(parts):
            return parts[idx - 1]
        if -len(parts) <= idx <= -1:
            return parts[idx]
        return ""
    if fn == "CONTAINS":
        return str(args[1]) in str(args[0]) if args[0] is not None else False
    if fn == "STARTSWITH":
        return str(args[0]).startswith(str(args[1]))
    if fn == "ENDSWITH":
        return str(args[0]).endswith(str(args[1]))
    if fn == "UPPER":
        return str(args[0]).upper()
    if fn == "LOWER":
        return str(args[0]).lower()
    if fn == "ROUND":
        return round(args[0], int(args[1]) if len(args) > 1 else 0) if args[0] is not None else None
    if fn == "ABS":
        return abs(args[0]) if args[0] is not None else None
    if fn == "CEILING":
        import math
        return math.ceil(args[0]) if args[0] is not None else None
    if fn == "FLOOR":
        import math
        return math.floor(args[0]) if args[0] is not None else None
    if fn == "INT":
        v = _num(args[0])
        return int(v) if v is not None else None
    if fn == "FLOAT":
        return _num(args[0])
    if fn == "STR":
        return str(args[0]) if args[0] is not None else None
    if fn == "MIN":
        return min(a for a in args if a is not None) if any(a is not None for a in args) else None
    if fn == "MAX":
        return max(a for a in args if a is not None) if any(a is not None for a in args) else None
    if fn == "POWER":
        return args[0] ** args[1]
    if fn == "SQRT":
        return args[0] ** 0.5 if args[0] is not None else None
    if fn == "EXP":
        import math
        return math.exp(args[0])
    if fn == "LOG":
        import math
        return math.log(args[0]) if len(args) == 1 else math.log(args[0], args[1])
    if fn == "LN":
        import math
        return math.log(args[0])
    raise UnsupportedFormula(f"unknown function {fn}")


def _eval(node: Any, row: Dict[str, Any]) -> Any:
    kind = node[0]
    if kind == "lit":
        return node[1]
    if kind == "field":
        return row.get(node[1])
    if kind == "call":
        return _call(node[1], [_eval(a, row) for a in node[2]])
    if kind == "if":
        for cond, val in node[1]:
            if _truthy(_eval(cond, row)):
                return _eval(val, row)
        return _eval(node[2], row)
    if kind == "unop":
        operand = _eval(node[2], row)
        if node[1] == "NOT":
            return not _truthy(operand)
        if node[1] == "-":
            v = _num(operand)
            return -v if v is not None else None
    if kind == "binop":
        op = node[1]
        if op == "AND":
            return _truthy(_eval(node[2], row)) and _truthy(_eval(node[3], row))
        if op == "OR":
            return _truthy(_eval(node[2], row)) or _truthy(_eval(node[3], row))
        left = _eval(node[2], row)
        right = _eval(node[3], row)
        if op in ("=", "<>"):
            eq = left == right
            return eq if op == "=" else not eq
        if left is None or right is None:
            return None
        if op == "<":
            return left < right
        if op == ">":
            return left > right
        if op == "<=":
            return left <= right
        if op == ">=":
            return left >= right
        if op == "+":
            if isinstance(left, str) or isinstance(right, str):
                return f"{left}{right}"
            lnum, rnum = _num(left), _num(right)
            return lnum + rnum if lnum is not None and rnum is not None else None
        lnum, rnum = _num(left), _num(right)
        if lnum is None or rnum is None:
            return None
        if op == "-":
            return lnum - rnum
        if op == "*":
            return lnum * rnum
        if op == "/":
            return lnum / rnum if rnum != 0 else None
    raise UnsupportedFormula(f"cannot evaluate node {node!r}")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compile_formula(formula: str) -> Callable[[Dict[str, Any]], Any]:
    """Parse a Tableau formula once; return a row → value function."""
    ast = _Parser(_tokenize(formula)).parse_expr()

    def run(row: Dict[str, Any]) -> Any:
        return _eval(ast, row)

    return run


def evaluate_formula(formula: str, row: Dict[str, Any]) -> Any:
    """One-shot helper: evaluate a formula against a single row dict."""
    return compile_formula(formula)(row)
