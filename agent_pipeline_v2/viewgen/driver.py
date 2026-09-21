"""LLM drivers for viewgen.

LLMDriver is deliberately minimal: one method, `generate(prompt) -> str`.
The mini-agent loop (loop.py) owns all control flow; drivers only talk to
the model. A Claude SDK driver can be added later behind the same protocol.
"""

from __future__ import annotations

import json
import os
import urllib.request
from pathlib import Path
from typing import Optional, Protocol

__all__ = ["LLMDriver", "APIConfig", "OpenAICompatDriver", "load_env"]


class LLMDriver(Protocol):
    def generate(self, prompt: str, *, temperature: float = 0.0) -> str: ...


def load_env(env_path: str | Path = ".env") -> None:
    """Populate os.environ from a .env file (no dependency on python-dotenv)."""
    path = Path(env_path)
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


class APIConfig:
    def __init__(self, key: str, base_url: str, model: str) -> None:
        self.key = key
        self.base_url = base_url.rstrip("/")
        self.model = model

    @classmethod
    def from_env(cls) -> "APIConfig":
        load_env()
        key = os.environ.get("LLM_KEY", "")
        base = os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1")
        model = os.environ.get("MODEL_NAME", "")
        if not key or not model:
            raise RuntimeError("LLM_KEY / MODEL_NAME 未在 .env 中配置")
        return cls(key, base, model)


class OpenAICompatDriver:
    """Plain HTTP driver for OpenAI-compatible chat completions APIs."""

    def __init__(self, config: Optional[APIConfig] = None, timeout: int = 300) -> None:
        self.config = config or APIConfig.from_env()
        self.timeout = timeout

    def generate(self, prompt: str, *, temperature: float = 0.0) -> str:
        body = {
            "model": self.config.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
        }
        req = urllib.request.Request(
            f"{self.config.base_url}/chat/completions",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.config.key}",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        return payload["choices"][0]["message"]["content"]
