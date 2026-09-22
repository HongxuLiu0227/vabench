"""multiagent — LangGraph-native dashboard generation (stage ④ multi-agent edition).

Architecture:
  supervisor (LLM: whole-dashboard guidance) ──fan-out──▶ view_worker subgraphs
  (one per view: generate → verify → route) ──join──▶ evaluator (program checks
  + LLM coherence review → repair tickets) ──loop or finish.

viewgen/ remains untouched as the single-loop baseline; this package is the
framework-native multi-agent implementation.
"""

from .graph import build_dashboard_graph

__all__ = ["build_dashboard_graph"]
