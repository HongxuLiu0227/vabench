"""Kimi CLI driver for single-pass pipeline.

Uses ~/.kimi/config.toml for model/provider configuration.
To switch models, change default_model in config.toml.

When model=gemini, injects a PYTHONSTARTUP patch to fix JSON Schema
compatibility issues in Kimi CLI's built-in tool definitions.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Optional

from .logging_config import get_logger

logger = get_logger(__name__)

_RETRYABLE_EXIT_CODES = {75}
_MAX_RETRIES = 3
_RETRY_BASE_DELAY = 10

_GEMINI_SCHEMA_PATCH = r'''
import json

_UNION_ONLY_KEYS = ("anyOf", "any_of", "oneOf", "one_of")
_ALL_UNION_KEYS = ("anyOf", "any_of", "oneOf", "one_of", "allOf", "all_of")
_SCHEMA_SIGNS = ("properties", "items", "$defs", "anyOf", "any_of",
                 "oneOf", "one_of", "allOf", "all_of", "additionalProperties",
                 "additional_properties", "enum", "required")
_SEEN = None  # set, initialized per top-level call to avoid cross-request pollution


def _is_schema(obj):
    return isinstance(obj, dict) and any(k in obj for k in _SCHEMA_SIGNS)


def _fix(schema):
    if not isinstance(schema, dict):
        return
    sid = id(schema)
    if sid in _SEEN:
        return
    _SEEN.add(sid)

    present_union = [k for k in _ALL_UNION_KEYS if k in schema and isinstance(schema[k], list)]

    if present_union:
        # Step 1: flatten nullable anyOf/oneOf (exactly 2 items: one non-null + one null)
        for key in present_union:
            items = schema[key]
            if len(items) == 2:
                non_null = [s for s in items if isinstance(s, dict) and s.get("type") != "null"]
                null_ones = [s for s in items if isinstance(s, dict) and s.get("type") == "null"]
                if len(non_null) == 1 and len(null_ones) == 1:
                    for k, v in non_null[0].items():
                        schema[k] = v
                    schema.pop(key, None)
                    schema.setdefault("nullable", True)
                    present_union = [k for k in _ALL_UNION_KEYS if k in schema and isinstance(schema[k], list)]
                    break

        # Step 2: anyOf/oneOf must NOT coexist with other fields (Gemini strict constraint).
        # If any non-union keys exist alongside a union, restructure into allOf.
        for key in present_union:
            other_keys = [k for k in schema if k not in _ALL_UNION_KEYS and k != "nullable"]
            if other_keys:
                other_part = {}
                for k in other_keys:
                    other_part[k] = schema.pop(k)
                union_part = {key: schema.pop(key)}
                schema["allOf"] = [other_part, union_part]
                present_union = [k for k in _ALL_UNION_KEYS if k in schema and isinstance(schema[k], list)]
                break

    # Step 3: add missing type (only when we have enough clues)
    if "type" not in schema and "$ref" not in schema:
        if "properties" in schema:
            schema["type"] = "object"
        elif "items" in schema:
            schema["type"] = "array"
        elif any(k in schema for k in _ALL_UNION_KEYS):
            schema["type"] = "object"
        elif "default" in schema:
            default = schema["default"]
            if isinstance(default, bool):
                schema["type"] = "boolean"
            elif isinstance(default, int):
                schema["type"] = "integer"
            elif isinstance(default, float):
                schema["type"] = "number"
            elif isinstance(default, str):
                schema["type"] = "string"

    # Recurse
    for k, v in list(schema.items()):
        if isinstance(v, dict):
            _fix(v)
        elif isinstance(v, list):
            for item in v:
                _fix(item)


def _walk_and_fix(obj):
    global _SEEN
    _SEEN = set()
    _walk(obj)


def _walk(obj):
    if isinstance(obj, dict):
        if id(obj) in _SEEN:
            return
        if _is_schema(obj):
            _fix(obj)   # _fix also recurses into nested dicts
        for v in obj.values():
            _walk(v)
    elif isinstance(obj, list):
        if id(obj) in _SEEN:
            return
        _SEEN.add(id(obj))
        for item in obj:
            _walk(item)

# Patch OpenAI SDK's request method to fix JSON body before sending
from openai._base_client import AsyncAPIClient as _AAC, SyncAPIClient as _SAC

_orig_async_request = _AAC.request
async def _patched_async_request(self, cast_to, options, **kwargs):
    if hasattr(options, 'json_data') and isinstance(options.json_data, dict):
        _walk_and_fix(options.json_data)
    return await _orig_async_request(self, cast_to, options, **kwargs)
_AAC.request = _patched_async_request

_orig_sync_request = _SAC.request
def _patched_sync_request(self, cast_to, options, **kwargs):
    if hasattr(options, 'json_data') and isinstance(options.json_data, dict):
        _walk_and_fix(options.json_data)
    return _orig_sync_request(self, cast_to, options, **kwargs)
_SAC.request = _patched_sync_request
'''


class KimiDriverError(RuntimeError):
    """Raised when Kimi CLI invocation fails."""


def _resolve_kimi_bin() -> str:
    candidates = [
        os.path.expanduser("~/.local/bin/kimi"),
        shutil.which("kimi"),
    ]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return candidate
    raise KimiDriverError(
        "kimi CLI not found. Install it from https://code.kimi.com"
    )


def _build_env(extra_env: Optional[dict] = None) -> dict:
    env = os.environ.copy()
    local_bin = os.path.expanduser("~/.local/bin")
    env["PATH"] = local_bin + os.pathsep + env.get("PATH", "")
    if extra_env:
        env.update(extra_env)
    return env


class KimiDriver:
    def __init__(self, timeout_seconds: int = 7200, model: str = "gpt5"):
        self.timeout_seconds = timeout_seconds
        self._model = model
        self._kimi_bin = _resolve_kimi_bin()

    def run(
        self,
        instruction: str,
        workdir: Path,
        session_id: Optional[str] = None,
        extra_env: Optional[dict] = None,
    ) -> str:
        env = _build_env(extra_env)

        # For gemini model: use wrapper script to inject schema fix before kimi runs.
        # PYTHONSTARTUP doesn't work for scripts, so we write a wrapper that patches
        # kosong, then imports and runs kimi_cli main.
        wrapper_file = None
        instruction_file = None
        if self._model.startswith("gemini"):
            # Write instruction to a temp file (avoids shell quoting issues)
            instruction_file = tempfile.NamedTemporaryFile(
                suffix=".txt", mode="w", delete=False, encoding="utf-8"
            )
            instruction_file.write(instruction)
            instruction_file.close()

            # Read kimi Python path from the kimi script's shebang
            kimi_python = None
            try:
                with open(self._kimi_bin) as f:
                    shebang = f.readline()
                if shebang.startswith("#!"):
                    kimi_python = shebang[2:].strip()
            except Exception:
                pass

            if kimi_python and Path(kimi_python).exists():
                # Build wrapper script
                wrapper_code = _GEMINI_SCHEMA_PATCH + f'''
import sys
sys.argv = ["kimi", "--print", "--yolo", "--afk", "--model", "{self._model}", "-p", open({instruction_file.name!r}, encoding="utf-8").read()]
from kimi_cli.__main__ import main
main()
'''
                wrapper_file = tempfile.NamedTemporaryFile(
                    suffix=".py", mode="w", delete=False, encoding="utf-8"
                )
                wrapper_file.write(wrapper_code)
                wrapper_file.close()

                cmd = [kimi_python, wrapper_file.name]
            else:
                # Fallback: no wrapper available
                cmd = [
                    self._kimi_bin,
                    "--print", "--yolo", "--afk",
                    "--model", self._model,
                    "-p", instruction,
                ]
        else:
            cmd = [
                self._kimi_bin,
                "--print", "--yolo", "--afk",
                "--model", self._model,
                "-p", instruction,
            ]

        logger.info(
            "Running Kimi CLI in %s (model=%s, timeout=%ds, max_retries=%d)",
            workdir,
            self._model,
            self.timeout_seconds,
            _MAX_RETRIES,
        )

        last_error: Optional[Exception] = None
        try:
            for attempt in range(1, _MAX_RETRIES + 2):
                try:
                    result = subprocess.run(
                        cmd,
                        cwd=workdir,
                        capture_output=True,
                        text=True,
                        timeout=self.timeout_seconds,
                        env=env,
                    )
                except subprocess.TimeoutExpired as exc:
                    last_error = exc
                    logger.warning(
                        "Kimi CLI attempt %d timed out after %ds",
                        attempt,
                        self.timeout_seconds,
                    )
                    if attempt <= _MAX_RETRIES:
                        delay = _RETRY_BASE_DELAY * (2 ** (attempt - 1))
                        logger.info("Retrying in %ds...", delay)
                        time.sleep(delay)
                        continue
                    raise KimiDriverError(
                        f"Kimi CLI timed out after {_MAX_RETRIES + 1} attempts "
                        f"({self.timeout_seconds}s each)"
                    ) from exc

                if result.returncode == 0:
                    return result.stdout

                if result.returncode in _RETRYABLE_EXIT_CODES and attempt <= _MAX_RETRIES:
                    delay = _RETRY_BASE_DELAY * (2 ** (attempt - 1))
                    stdout_tail = result.stdout.strip()[-200:] if result.stdout else ""
                    stderr_tail = result.stderr.strip()[-200:] if result.stderr else ""
                    logger.warning(
                        "Kimi CLI attempt %d failed (code=%d). "
                        "stdout: %s | stderr: %s",
                        attempt,
                        result.returncode,
                        stdout_tail,
                        stderr_tail,
                    )
                    logger.info("Retrying in %ds...", delay)
                    time.sleep(delay)
                    continue

                # Non-retryable failure
                detail_parts = []
                if result.stdout:
                    detail_parts.append(
                        "stdout: " + result.stdout.strip()[-300:]
                    )
                if result.stderr:
                    detail_parts.append(
                        "stderr: " + result.stderr.strip()[-300:]
                    )
                detail = " | ".join(detail_parts) if detail_parts else "no output"
                raise KimiDriverError(
                    f"Kimi CLI exited with code {result.returncode}: {detail}"
                )

            # Exhausted retries
            raise KimiDriverError(
                f"Kimi CLI failed after {_MAX_RETRIES + 1} attempts. "
                f"Last error: {last_error}"
            )
        finally:
            for tmp in (wrapper_file, instruction_file):
                if tmp is not None:
                    try:
                        os.unlink(tmp.name)
                    except OSError:
                        pass


__all__ = ["KimiDriver", "KimiDriverError"]
