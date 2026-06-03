from __future__ import annotations

import contextlib
import os
import socket
import subprocess
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from shutil import which
from urllib.parse import urlparse

from .dom_snapshot import normalize_text
from .models import DashboardSpec, MarkSnapshot, ProjectSnapshot, ViewSnapshot


SCAN_PAGE_JS = r"""
() => {
  const preferredSelectors = '.worksheet,.worksheet-container,.chart-card';
  const fallbackSelectors = '[class*="worksheet"],[class*="chart"],[class*="card"]';

  const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
  const quantize = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

  const isVisible = (element) => {
    if (!element || !(element instanceof Element)) {
      return false;
    }
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || '1') === 0) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
  };

  const chooseContainer = (graphic) => {
    let current = graphic.parentElement;
    let best = current || graphic;
    let bestScore = -Infinity;
    while (current && current !== document.body) {
      const rect = current.getBoundingClientRect();
      if (rect.width > 80 && rect.height > 80) {
        const headingCount = Array.from(current.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(isVisible).length;
        const graphicCount = current.querySelectorAll('svg,canvas').length;
        let score = 0;
        if (current.matches(preferredSelectors)) {
          score += 5;
        } else if (current.matches(fallbackSelectors)) {
          score += 2;
        }
        if (graphicCount === 1) {
          score += 4;
        } else if (graphicCount > 1) {
          score -= Math.min(graphicCount, 6);
        }
        if (headingCount > 0) {
          score += 4;
        }
        if (rect.width * rect.height > 40000) {
          score += 1;
        }
        if (score >= bestScore) {
          bestScore = score;
          best = current;
        }
      }
      current = current.parentElement;
    }
    return best;
  };

  const collectTexts = (container) => {
    const values = [];
    const seen = new Set();
    const pushValue = (value) => {
      const text = normalize(value);
      if (!text || text.length > 160) {
        return;
      }
      const key = text.toLowerCase();
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      values.push(text);
    };

    container.querySelectorAll('h1,h2,h3,h4,h5,h6,svg text,svg title,p,span,button,div').forEach((element) => {
      if (!isVisible(element)) {
        return;
      }
      pushValue(element.textContent || '');
    });
    return values.slice(0, 200);
  };

  const collectMarks = (container) => {
    const containerRect = container.getBoundingClientRect();
    const marks = [];

    container.querySelectorAll('svg rect,svg circle,svg path,svg line,svg ellipse,svg polygon,svg polyline').forEach((element, index) => {
      if (!isVisible(element)) {
        return;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width < 1 && rect.height < 1) {
        return;
      }
      const style = window.getComputedStyle(element);
      const titleElement = element.querySelector('title');
      marks.push({
        index,
        tag: element.tagName.toLowerCase(),
        title: normalize(
          element.getAttribute('aria-label') ||
          element.getAttribute('data-label') ||
          (titleElement ? titleElement.textContent : '') ||
          ''
        ),
        center_x: quantize((rect.left + rect.width / 2 - containerRect.left) / Math.max(containerRect.width, 1)),
        center_y: quantize((rect.top + rect.height / 2 - containerRect.top) / Math.max(containerRect.height, 1)),
        width: quantize(rect.width / Math.max(containerRect.width, 1)),
        height: quantize(rect.height / Math.max(containerRect.height, 1)),
        area: quantize((rect.width * rect.height) / Math.max(containerRect.width * containerRect.height, 1)),
        fill: normalize(style.fill || '').toLowerCase(),
        stroke: normalize(style.stroke || '').toLowerCase(),
        opacity: quantize(Number(style.opacity || style.getPropertyValue('fill-opacity') || 1), 2),
        cursor: normalize(style.cursor || '').toLowerCase(),
      });
    });

    marks.sort((left, right) => {
      const leftScore = left.area + (left.title ? 0.1 : 0) + (left.cursor === 'pointer' ? 0.1 : 0);
      const rightScore = right.area + (right.title ? 0.1 : 0) + (right.cursor === 'pointer' ? 0.1 : 0);
      return rightScore - leftScore;
    });
    return marks.slice(0, 120);
  };

  const titleFor = (container) => {
    const heading = Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6')).find(isVisible);
    if (heading) {
      return normalize(heading.textContent || '');
    }
    const svgText = Array.from(container.querySelectorAll('svg text')).find((element) => {
      if (!isVisible(element)) {
        return false;
      }
      const text = normalize(element.textContent || '');
      return Boolean(text) && text.length < 120;
    });
    if (svgText) {
      return normalize(svgText.textContent || '');
    }
    return '';
  };

  const graphicContainers = [];
  const seen = new Set();
  document.querySelectorAll('svg,canvas').forEach((graphic) => {
    const container = chooseContainer(graphic);
    if (!container) {
      return;
    }
    const key = container;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    graphicContainers.push(container);
  });

  const ordered = graphicContainers
    .map((container, order) => {
      const rect = container.getBoundingClientRect();
      return {
        order,
        title: titleFor(container),
        bbox_top: quantize(rect.top, 1),
        bbox_left: quantize(rect.left, 1),
        bbox_width: quantize(rect.width, 1),
        bbox_height: quantize(rect.height, 1),
        texts: collectTexts(container),
        marks: collectMarks(container),
      };
    })
    .sort((left, right) => {
      if (left.bbox_top === right.bbox_top) {
        return left.bbox_left - right.bbox_left;
      }
      return left.bbox_top - right.bbox_top;
    });

  return ordered;
}
"""


def _load_playwright():
    try:
        from playwright.async_api import async_playwright
    except ModuleNotFoundError as error:
        raise RuntimeError(
            "Playwright is not installed in the active Python environment. "
            "Install it with `/Users/jack/miniconda3/bin/python -m pip install playwright` "
            "and then run `/Users/jack/miniconda3/bin/python -m playwright install chromium`."
        ) from error

    return async_playwright


class QuietHTTPRequestHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return


@contextlib.contextmanager
def serve_directory(directory: Path):
    directory = directory.resolve()
    handler = partial(QuietHTTPRequestHandler, directory=str(directory))
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.bind(("127.0.0.1", 0))
        _, port = probe.getsockname()

    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{port}"
    finally:
        server.shutdown()
        thread.join(timeout=2)
        server.server_close()


@contextlib.contextmanager
def serve_project(spec: DashboardSpec):
    if spec.serve_mode == "static":
        with serve_directory(spec.servable_dir) as url:
            yield url
        return

    if spec.serve_mode != "vite":
        raise RuntimeError(f"Unsupported serve mode: {spec.serve_mode}")

    npm_bin = _resolve_npm()
    env = _node_env()
    _ensure_project_dependencies(spec.project_root, npm_bin, env)
    _ensure_project_build(spec.project_root, npm_bin, env)

    dist_dir = spec.project_root / "dist"
    if not (dist_dir / "index.html").is_file():
        raise RuntimeError(f"Expected build output at {dist_dir / 'index.html'}")

    with serve_directory(dist_dir) as url:
        yield url


class BrowserProjectRunner:
    def __init__(self, base_url: str, route: str, viewport_width: int, viewport_height: int, page_ready_timeout_ms: int, post_load_settle_ms: int):
        self._async_playwright = _load_playwright()
        self.base_url = base_url.rstrip("/")
        self.route = route if route.startswith("/") else f"/{route}"
        self.viewport_width = viewport_width
        self.viewport_height = viewport_height
        self.page_ready_timeout_ms = page_ready_timeout_ms
        self.post_load_settle_ms = post_load_settle_ms
        self._playwright_manager = None
        self._browser = None
        self._context = None
        self._page = None
        self._data_requests: list[str] = []

    async def __aenter__(self) -> "BrowserProjectRunner":
        self._playwright_manager = await self._async_playwright().start()
        self._browser = await self._playwright_manager.chromium.launch(headless=True)
        self._context = await self._browser.new_context(
            viewport={"width": self.viewport_width, "height": self.viewport_height}
        )
        self._page = await self._context.new_page()
        self._page.on("request", self._handle_request)
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        if self._page:
            await self._page.close()
        if self._context:
            await self._context.close()
        if self._browser:
            await self._browser.close()
        if self._playwright_manager:
            await self._playwright_manager.stop()

    @property
    def data_requests(self) -> tuple[str, ...]:
        return tuple(self._data_requests)

    async def reset(self) -> None:
        self._data_requests.clear()
        await self._page.goto(f"{self.base_url}{self.route}", wait_until="domcontentloaded")
        await self._page.wait_for_selector("svg, canvas", timeout=self.page_ready_timeout_ms)
        if self.post_load_settle_ms > 0:
            await self._page.wait_for_timeout(self.post_load_settle_ms)

    async def capture_snapshot(self, worksheet_names_by_id: dict[str, str]) -> ProjectSnapshot:
        if self._page is None:
            raise RuntimeError("BrowserProjectRunner must be entered before use.")
        raw_views = await self._page.evaluate(SCAN_PAGE_JS)
        view_candidates = [_deserialize_view(candidate) for candidate in raw_views]
        matched_views = _match_views(worksheet_names_by_id, view_candidates)
        return ProjectSnapshot(views=matched_views, data_requests=self.data_requests)

    async def click_mark(self, source_view: ViewSnapshot, mark: MarkSnapshot) -> None:
        if self._page is None:
            raise RuntimeError("BrowserProjectRunner must be entered before use.")
        x = source_view.bbox_left + (mark.center_x * source_view.bbox_width)
        y = source_view.bbox_top + (mark.center_y * source_view.bbox_height)
        await self._page.mouse.click(x, y)

    async def wait_for_state_change(self, source_snapshot: ProjectSnapshot, worksheet_name_by_id: dict[str, str], poll_interval_ms: int, timeout_ms: int) -> ProjectSnapshot:
        if self._page is None:
            raise RuntimeError("BrowserProjectRunner must be entered before use.")
        elapsed = 0
        latest = await self.capture_snapshot(worksheet_name_by_id)
        while elapsed < timeout_ms:
            if latest.views != source_snapshot.views:
                return latest
            await self._page.wait_for_timeout(poll_interval_ms)
            elapsed += poll_interval_ms
            latest = await self.capture_snapshot(worksheet_name_by_id)
        return latest

    def _handle_request(self, request) -> None:
        parsed = urlparse(request.url)
        if "/data/" in parsed.path:
            self._data_requests.append(parsed.path)


def _deserialize_view(raw: dict) -> ViewSnapshot:
    marks = tuple(
        MarkSnapshot(
            index=int(mark["index"]),
            tag=mark.get("tag", ""),
            title=normalize_text(mark.get("title", "")),
            center_x=float(mark.get("center_x", 0.0)),
            center_y=float(mark.get("center_y", 0.0)),
            width=float(mark.get("width", 0.0)),
            height=float(mark.get("height", 0.0)),
            area=float(mark.get("area", 0.0)),
            fill=normalize_text(mark.get("fill", "")),
            stroke=normalize_text(mark.get("stroke", "")),
            opacity=float(mark.get("opacity", 1.0)),
            cursor=normalize_text(mark.get("cursor", "")),
        )
        for mark in raw.get("marks", [])
    )
    texts = tuple(normalize_text(text) for text in raw.get("texts", []) if normalize_text(text))
    return ViewSnapshot(
        title=raw.get("title", ""),
        order=int(raw.get("order", 0)),
        bbox_top=float(raw.get("bbox_top", 0.0)),
        bbox_left=float(raw.get("bbox_left", 0.0)),
        bbox_width=float(raw.get("bbox_width", 0.0)),
        bbox_height=float(raw.get("bbox_height", 0.0)),
        texts=texts,
        marks=marks,
    )


def _match_views(worksheet_names_by_id: dict[str, str], candidates: list[ViewSnapshot]) -> dict[str, ViewSnapshot]:
    from .dom_snapshot import title_similarity

    remaining_ids = list(worksheet_names_by_id.keys())
    remaining_candidates = list(candidates)
    matches: dict[str, ViewSnapshot] = {}

    scored_pairs: list[tuple[float, str, ViewSnapshot]] = []
    for worksheet_id, worksheet_name in worksheet_names_by_id.items():
        for candidate in candidates:
            scored_pairs.append((title_similarity(worksheet_name, candidate.title), worksheet_id, candidate))

    for score, worksheet_id, candidate in sorted(scored_pairs, key=lambda entry: entry[0], reverse=True):
        if worksheet_id not in remaining_ids or candidate not in remaining_candidates:
            continue
        if score < 0.35:
            continue
        matches[worksheet_id] = candidate
        remaining_ids.remove(worksheet_id)
        remaining_candidates.remove(candidate)

    for worksheet_id, candidate in zip(remaining_ids, sorted(remaining_candidates, key=lambda view: view.order)):
        matches[worksheet_id] = candidate

    return matches
def _resolve_npm() -> str:
    return (
        which("npm")
        or "/Users/jack/.nvm/versions/node/v22.17.0/bin/npm"
    )


def _node_env() -> dict[str, str]:
    env = os.environ.copy()
    node_bin_dir = str(Path(_resolve_npm()).expanduser().parent)
    current_path = env.get("PATH", "")
    if node_bin_dir not in current_path.split(":"):
        env["PATH"] = f"{node_bin_dir}:{current_path}" if current_path else node_bin_dir
    return env


def _ensure_project_dependencies(project_root: Path, npm_bin: str, env: dict[str, str]) -> None:
    if (project_root / "node_modules").is_dir():
        return

    install_attempts = (
        [[npm_bin, "ci", "--no-fund", "--no-audit"], [npm_bin, "install", "--no-fund", "--no-audit"]]
        if (project_root / "package-lock.json").is_file()
        else [[npm_bin, "install", "--no-fund", "--no-audit"]]
    )
    install_error = None
    for install_cmd in install_attempts:
        try:
            subprocess.run(
                install_cmd,
                cwd=project_root,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                env=env,
            )
            install_error = None
            break
        except subprocess.CalledProcessError as error:
            install_error = error
    if install_error is not None:
        raise RuntimeError(f"Dependency install failed for {project_root}:\n{install_error.stdout}")


def _ensure_project_build(project_root: Path, npm_bin: str, env: dict[str, str]) -> None:
    dist_index = project_root / "dist" / "index.html"
    if dist_index.is_file():
        return

    build_cmd = [npm_bin, "run", "build"]
    try:
        subprocess.run(
            build_cmd,
            cwd=project_root,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            env=env,
        )
    except subprocess.CalledProcessError as error:
        raise RuntimeError(f"Build failed for {project_root}:\n{error.stdout}") from error
