"""Utilities for invoking the Claude Code SDK with DeepSeek settings."""

from __future__ import annotations

import asyncio
import os
from pathlib import Path
from typing import Optional

try:
    from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient, Message, ClaudeSDKError  # type: ignore
except ModuleNotFoundError as exc:  # pragma: no cover
    ClaudeAgentOptions = None  # type: ignore
    ClaudeSDKClient = None  # type: ignore
    Message = None  # type: ignore

    class ClaudeSDKError(Exception):
        pass

    _CLAUDE_IMPORT_ERROR: Optional[Exception] = exc
else:
    _CLAUDE_IMPORT_ERROR = None

try:
    from dotenv import load_dotenv  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    def load_dotenv(*args, **kwargs):  # type: ignore
        return False

from .pipeline.utils import env_with_node_path


class ClaudeDriverError(RuntimeError):
    """Raised when the Claude SDK invocation fails."""


class ClaudeDriver:
    """Wrapper around Claude Agent SDK to run non-interactive prompts."""

    def __init__(self, timeout_seconds: int = 600):
        load_dotenv()
        if _CLAUDE_IMPORT_ERROR is not None:
            raise ClaudeDriverError(
                "claude_agent_sdk is not installed; cannot run Claude-driven pipeline stages."
            )
        # Dedicated Claude Code credentials (fall back to shared vars)
        self.api_key = os.getenv("CLAUDE_CODE_KEY") or os.getenv("LLM_KEY")
        self.anthropic_base_url = os.getenv("CLAUDE_CODE_BASE_URL") or os.getenv("ANTHROPIC_BASE_URL")
        self.model_name = os.getenv("CLAUDE_CODE_MODEL") or os.getenv("MODEL_NAME")
        if not self.api_key:
            raise ClaudeDriverError("CLAUDE_CODE_KEY or LLM_KEY is not set; cannot authenticate to Claude.")
        self.timeout_seconds = timeout_seconds

    def run(
        self,
        instruction: str,
        workdir: Path,
        session_id: Optional[str] = None,
        extra_env: Optional[dict] = None,
    ) -> str:
        env = {
            "ANTHROPIC_BASE_URL": self.anthropic_base_url,
            "ANTHROPIC_AUTH_TOKEN": self.api_key,
            "API_TIMEOUT_MS": "600000",
            # "ANTHROPIC_MODEL": "deepseek-chat",
            # "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-chat",
            "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
        }
        if extra_env:
            env.update(extra_env)
        env = env_with_node_path(env)

        options = ClaudeAgentOptions(
            cwd=str(workdir),
            env=env,
            add_dirs=[str(workdir)],
            allowed_tools=[
                "Read",
                "Write",
                "Edit",
                "Delete",
                "Move",
                "Glob",
                "Grep",
                "Bash",
                "Task",
            ],
            permission_mode="acceptEdits",
            continue_conversation=False,
        )

        async def _run() -> str:
            async def _run_with_deadline() -> str:
                async with ClaudeSDKClient(options=options) as client:
                    await asyncio.wait_for(client.connect(), timeout=60)
                    await asyncio.wait_for(client.query(instruction, session_id=session_id or "default"), timeout=30)

                    async def collect_response() -> str:
                        collected: list[str] = []
                        async for message in client.receive_response():
                            text = _extract_text(message)
                            if text:
                                collected.append(text)
                        return "\n".join(collected)

                    try:
                        return await asyncio.wait_for(collect_response(), timeout=self.timeout_seconds)
                    except asyncio.TimeoutError as exc:
                        raise ClaudeDriverError(f"Claude SDK timed out after {self.timeout_seconds}s") from exc

            try:
                return await asyncio.wait_for(_run_with_deadline(), timeout=self.timeout_seconds + 120)
            except asyncio.TimeoutError as exc:
                raise ClaudeDriverError(f"Claude SDK stage timed out after {self.timeout_seconds + 120}s") from exc

        try:
            return asyncio.run(_run())
        except ClaudeSDKError as exc:
            raise ClaudeDriverError(str(exc)) from exc


def _extract_text(message: Message) -> str:
    if hasattr(message, "content"):
        blocks = getattr(message, "content")
        if isinstance(blocks, list):
            return "\n".join(block.text for block in blocks if hasattr(block, "text"))
        if isinstance(blocks, str):
            return blocks
    if getattr(message, "result", None):
        return str(message.result)
    return ""


__all__ = ["ClaudeDriver", "ClaudeDriverError"]
