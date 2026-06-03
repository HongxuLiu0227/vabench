from __future__ import annotations

import math
import re
from collections import Counter
from difflib import SequenceMatcher

from .models import MarkSnapshot, ViewDelta, ViewSnapshot

_NUMBER_RE = re.compile(r"(?P<number>-?\d[\d,]*(?:\.\d+)?)")
_SPACE_RE = re.compile(r"\s+")


def normalize_text(value: str) -> str:
    if not value:
        return ""
    normalized = value.replace("\u2212", "-")
    normalized = _SPACE_RE.sub(" ", normalized.strip().lower())

    def _replace(match: re.Match[str]) -> str:
        token = match.group("number").replace(",", "")
        try:
            number = float(token)
        except ValueError:
            return match.group(0)
        if number.is_integer():
            return str(int(number))
        return f"{number:.4f}".rstrip("0").rstrip(".")

    return _NUMBER_RE.sub(_replace, normalized)


def title_similarity(expected: str, actual: str) -> float:
    left = normalize_text(expected)
    right = normalize_text(actual)
    if not left or not right:
        return 0.0
    if left == right:
        return 1.0
    if left in right or right in left:
        return 0.92
    left_tokens = set(left.split())
    right_tokens = set(right.split())
    overlap = len(left_tokens & right_tokens) / max(len(left_tokens), 1)
    return max(overlap, SequenceMatcher(None, left, right).ratio())


def multiset_overlap(reference_tokens: list[str], candidate_tokens: list[str]) -> float:
    if not reference_tokens:
        return 1.0
    if not candidate_tokens:
        return 0.0
    reference_counter = Counter(reference_tokens)
    candidate_counter = Counter(candidate_tokens)
    matched = sum(min(count, candidate_counter[token]) for token, count in reference_counter.items())
    return matched / sum(reference_counter.values())


def view_data_similarity(reference: ViewSnapshot, candidate: ViewSnapshot, *, text_weight: float, geometry_weight: float) -> float:
    reference_text = [normalize_text(text) for text in reference.texts if normalize_text(text)]
    candidate_text = [normalize_text(text) for text in candidate.texts if normalize_text(text)]
    reference_geometry = _collect_geometry_tokens(reference.marks)
    candidate_geometry = _collect_geometry_tokens(candidate.marks)

    text_score = multiset_overlap(reference_text, candidate_text)
    geometry_score = multiset_overlap(reference_geometry, candidate_geometry)

    if not reference_geometry:
        return text_score
    if not reference_text:
        return geometry_score
    return (text_weight * text_score) + (geometry_weight * geometry_score)


def view_state_similarity(reference: ViewSnapshot, candidate: ViewSnapshot) -> float:
    reference_tokens = _collect_state_tokens(reference)
    candidate_tokens = _collect_state_tokens(candidate)
    return multiset_overlap(reference_tokens, candidate_tokens)


def view_state_change(before: ViewSnapshot, after: ViewSnapshot) -> float:
    return 1.0 - view_state_similarity(before, after)


def mark_state_similarity(reference: MarkSnapshot, candidate: MarkSnapshot) -> float:
    return multiset_overlap(reference.state_tokens(), candidate.state_tokens())


def choose_best_matching_mark(reference_mark: MarkSnapshot, candidate_marks: tuple[MarkSnapshot, ...]) -> MarkSnapshot | None:
    if not candidate_marks:
        return None

    best_score = -math.inf
    best_mark: MarkSnapshot | None = None
    reference_title_tokens = set(normalize_text(reference_mark.title).split())

    for mark in candidate_marks:
        mark_title_tokens = set(normalize_text(mark.title).split())
        title_overlap = (
            len(reference_title_tokens & mark_title_tokens) / max(len(reference_title_tokens | mark_title_tokens), 1)
            if reference_title_tokens or mark_title_tokens
            else 0.0
        )
        tag_bonus = 1.0 if mark.tag == reference_mark.tag else 0.0
        position_bonus = 1.0 - min(
            1.0,
            abs(reference_mark.center_x - mark.center_x) + abs(reference_mark.center_y - mark.center_y),
        )
        area_bonus = 1.0 - min(1.0, abs(reference_mark.area - mark.area))
        score = (3.0 * title_overlap) + (0.75 * tag_bonus) + (0.75 * position_bonus) + (0.5 * area_bonus)
        if score > best_score:
            best_score = score
            best_mark = mark

    return best_mark


def extract_view_delta(before: ViewSnapshot, after: ViewSnapshot) -> ViewDelta:
    changed_texts = tuple(_extract_changed_texts(before.texts, after.texts))
    changed_marks = _extract_changed_mark_tokens(before.marks, after.marks)
    changed_mark_tokens = tuple(token for mark_tokens in changed_marks for token in mark_tokens)
    return ViewDelta(
        changed_texts=changed_texts,
        changed_mark_tokens=changed_mark_tokens,
        changed_text_count=len(changed_texts),
        changed_mark_count=len(changed_marks),
    )


def view_delta_similarity(reference: ViewDelta, candidate: ViewDelta) -> float:
    return multiset_overlap(reference.tokens(), candidate.tokens())


def _collect_geometry_tokens(marks: tuple[MarkSnapshot, ...]) -> list[str]:
    tokens: list[str] = []
    for mark in marks:
        tokens.extend(mark.data_tokens())
    return tokens


def _collect_state_tokens(view: ViewSnapshot) -> list[str]:
    tokens = [normalize_text(text) for text in view.texts if normalize_text(text)]
    for mark in view.marks:
        tokens.extend(mark.state_tokens())
    return tokens


def _extract_changed_texts(before_texts: tuple[str, ...], after_texts: tuple[str, ...]) -> list[str]:
    before_counter = Counter(normalize_text(text) for text in before_texts if normalize_text(text))
    after_counter = Counter(normalize_text(text) for text in after_texts if normalize_text(text))
    delta = after_counter - before_counter
    tokens: list[str] = []
    for token, count in delta.items():
        tokens.extend([f"text:{token}"] * count)
    return tokens


def _extract_changed_mark_tokens(before_marks: tuple[MarkSnapshot, ...], after_marks: tuple[MarkSnapshot, ...]) -> list[list[str]]:
    remaining_after = list(after_marks)
    changed: list[list[str]] = []

    for before_mark in before_marks:
        matched = choose_best_matching_mark(before_mark, tuple(remaining_after))
        if matched is None:
            continue
        remaining_after.remove(matched)
        if mark_state_similarity(before_mark, matched) < 0.999:
            changed.append(_mark_region_tokens(matched))

    for mark in remaining_after:
        changed.append(_mark_region_tokens(mark))

    return changed


def _mark_region_tokens(mark: MarkSnapshot) -> list[str]:
    return [f"changed:{token}" for token in mark.data_tokens()]
