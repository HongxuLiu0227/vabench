#!/usr/bin/env python3
import csv
import os
import re
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from tqdm import tqdm

CSV_PATH = Path(__file__).resolve().parent / "dashboard_link_application.csv"
OUTPUT_DIR = Path(__file__).resolve().parent
COOLDOWN_SECONDS = 5
CHUNK_SIZE = 1024 * 1024


def normalize_link(url):
    if not url:
        return ""
    parsed = urlparse(url)
    if parsed.netloc.lower() == "github.com":
        parts = parsed.path.split("/")
        if "blob" in parts:
            blob_index = parts.index("blob")
            owner = parts[1] if len(parts) > 1 else ""
            repo = parts[2] if len(parts) > 2 else ""
            ref = parts[blob_index + 1] if len(parts) > blob_index + 1 else ""
            path = "/".join(parts[blob_index + 2 :]) if len(parts) > blob_index + 2 else ""
            if owner and repo and ref and path:
                return "https://raw.githubusercontent.com/{}/{}/{}/{}".format(
                    owner, repo, ref, path
                )
        if "raw" in parts:
            raw_index = parts.index("raw")
            owner = parts[1] if len(parts) > 1 else ""
            repo = parts[2] if len(parts) > 2 else ""
            ref = parts[raw_index + 1] if len(parts) > raw_index + 1 else ""
            path = "/".join(parts[raw_index + 2 :]) if len(parts) > raw_index + 2 else ""
            if owner and repo and ref and path:
                return "https://raw.githubusercontent.com/{}/{}/{}/{}".format(
                    owner, repo, ref, path
                )
    return url


def sanitize_filename(name):
    name = name.strip()
    name = name.replace(os.sep, "_")
    if os.altsep:
        name = name.replace(os.altsep, "_")
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)
    return name or "download"


def build_output_path(img_id, url):
    parsed = urlparse(url)
    filename = os.path.basename(parsed.path) or "download"
    filename = sanitize_filename(filename)
    if img_id:
        prefix = sanitize_filename(img_id)
        filename = "{}__{}".format(prefix, filename)
    return OUTPUT_DIR / filename


def download_file(url, dest_path):
    temp_path = dest_path.with_suffix(dest_path.suffix + ".part")
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=30) as response:
        status = getattr(response, "status", None)
        if status and status >= 400:
            raise HTTPError(url, status, "HTTP error", response.headers, None)
        with temp_path.open("wb") as handle:
            while True:
                chunk = response.read(CHUNK_SIZE)
                if not chunk:
                    break
                handle.write(chunk)
    temp_path.replace(dest_path)


def load_rows(csv_path):
    with csv_path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
    return rows


def main():
    if not CSV_PATH.exists():
        raise SystemExit("Missing CSV file: {}".format(CSV_PATH))

    rows = load_rows(CSV_PATH)
    seen_urls = set()
    skipped = 0
    downloaded = 0
    failed = 0

    for row in tqdm(rows, desc="Downloading", unit="file"):
        lower_row = {k.lower(): (v or "").strip() for k, v in row.items()}
        link = lower_row.get("link", "")
        img_id = lower_row.get("imgid", "")
        if not link:
            skipped += 1
            continue

        url = normalize_link(link)
        if url in seen_urls:
            skipped += 1
            continue
        seen_urls.add(url)

        dest_path = build_output_path(img_id, url)
        if dest_path.exists():
            skipped += 1
            continue

        try:
            download_file(url, dest_path)
        except (HTTPError, URLError, OSError) as exc:
            failed += 1
            if dest_path.exists():
                dest_path.unlink()
            part_path = dest_path.with_suffix(dest_path.suffix + ".part")
            if part_path.exists():
                part_path.unlink()
            print("Failed: {} -> {} ({})".format(url, dest_path.name, exc))
            continue

        downloaded += 1
        time.sleep(COOLDOWN_SECONDS)

    print(
        "Done. Downloaded: {}, skipped: {}, failed: {}".format(
            downloaded, skipped, failed
        )
    )


if __name__ == "__main__":
    main()
