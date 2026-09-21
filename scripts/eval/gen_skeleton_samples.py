#!/usr/bin/env python3
"""Generate skeletons for N random workbooks: build + render screenshots."""
import json
import random
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from agent_pipeline_v2.spec import build_wis  # noqa: E402
from agent_pipeline_v2.dataprep.csv_loader import find_data_file, load_enriched_dataset  # noqa: E402
from agent_pipeline_v2.dataprep.query_spec import derive_view_specs  # noqa: E402
from agent_pipeline_v2.skeleton.builder import build_project  # noqa: E402

ROOT = Path("output/dashboard/output_twbx_single")
OUT_ROOT = Path("output/gen_v2")
SHOT_JS = Path("/tmp/shot_one.js")

# puppeteer screenshot helper (reuses project-renderer deps)
SHOT_JS.write_text("""
const puppeteer = require('/Users/liuhongxu/Documents/vabench/project-renderer/node_modules/puppeteer-core');
const [,, url, out, w, h] = process.argv;
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: +w, height: +h });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})().catch(e => { console.error(e.message); process.exit(1); });
""")


def run(cmd, cwd=None, timeout=600):
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)


def main() -> None:
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    seed = int(sys.argv[2]) if len(sys.argv) > 2 else 42
    dirs = sorted(p for p in ROOT.iterdir() if p.is_dir() and list(p.glob("*.twb")) and (p / "data").exists())
    random.seed(seed)
    picks = random.sample([d for d in dirs if not d.name.startswith("160_")], n)

    report = []
    for i, d in enumerate(picks, 1):
        rec = {"dir": d.name, "ok": False}
        try:
            twb = list(d.glob("*.twb"))[0]
            wis = build_wis(twb)
            ds = wis["datasources"][0] if wis.get("datasources") else {}
            csv = find_data_file(d / "data", ds.get("caption", ""))
            calc = [cf for ws in wis["worksheets"] for cf in ws["calculated_fields"]]
            dataset = load_enriched_dataset(csv, name=ds.get("caption", ""),
                                            wis_fields=ds.get("fields", []), calculated_fields=calc)
            specs = derive_view_specs(wis)
            vid = d.name.split("_")[0]
            out = OUT_ROOT / vid
            result = build_project(wis, dataset, specs, out, force=True)

            r = run(["npm", "install", "--no-audit", "--no-fund"], cwd=out)
            if r.returncode != 0:
                raise RuntimeError("npm install failed: " + r.stderr[-200:])
            r = run(["npm", "run", "build"], cwd=out)
            if r.returncode != 0:
                raise RuntimeError("build failed: " + (r.stderr or r.stdout)[-300:])

            # preview + screenshot
            port = 4200 + i
            proc = subprocess.Popen(
                ["npx", "vite", "preview", "--port", str(port), "--host", "127.0.0.1"],
                cwd=out, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                import time
                time.sleep(3)
                shot = f"/tmp/gen_v2_{vid}.png"
                r = run(["node", str(SHOT_JS), f"http://127.0.0.1:{port}/", shot, "1280", "900"])
                if r.returncode != 0:
                    raise RuntimeError("screenshot failed: " + r.stderr[-200:])
            finally:
                proc.terminate()
            rec.update({"ok": True, "views": result["views"], "shot": f"/tmp/gen_v2_{vid}.png",
                        "missing": result["missing_fields"]})
            print(f"[{i}/{n}] ✅ {d.name[:50]} views={len(result['views'])}", flush=True)
        except Exception as e:
            rec["error"] = f"{type(e).__name__}: {e}"
            print(f"[{i}/{n}] ❌ {d.name[:50]} {rec['error'][:80]}", flush=True)
        report.append(rec)

    Path("output/gen_v2/batch5_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    ok = sum(1 for r in report if r["ok"])
    print(f"\n完成: {ok}/{n}")


if __name__ == "__main__":
    main()
