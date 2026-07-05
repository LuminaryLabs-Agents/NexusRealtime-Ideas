#!/usr/bin/env python3
import argparse
import hashlib
import json
import math
import os
import re
import shutil
import tempfile
from pathlib import Path

import pyarrow.parquet as pq
import requests


DATASET_ID = "IVproger/rawg-games-dataset-updated"
CHUNK_SIZE = 5000


def slugify(value, fallback="game"):
    text = re.sub(r"[^a-z0-9]+", "-", str(value or fallback).strip().lower().replace('"', ""))
    text = re.sub(r"^-+|-+$", "", text)
    return text or fallback


def segment(value, fallback="general"):
    return slugify(value, fallback)


def default_timeline(category):
    tag = category or "game"
    return [
        {"step": 1, "label": "setup", "detail": f"Enter the {tag} loop and establish the starting state."},
        {"step": 2, "label": "first action", "detail": "Make the first meaningful move or decision."},
        {"step": 3, "label": "core loop", "detail": "Repeat the main play pattern and build momentum."},
        {"step": 4, "label": "escalation", "detail": "Challenge, pressure, or complexity increases."},
        {"step": 5, "label": "session end", "detail": "Resolve the run, match, or play session."},
    ]


def stringify_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        out = []
        for item in value:
            if isinstance(item, dict):
                for key in ("name", "slug", "title", "label"):
                    if item.get(key):
                        out.append(str(item[key]))
                        break
            elif item is not None:
                out.append(str(item))
        return [x for x in out if x]
    if isinstance(value, dict):
        for key in ("name", "slug", "title", "label"):
            if value.get(key):
                return [str(value[key])]
        return []
    if isinstance(value, str):
        return [value]
    return [str(value)]


def first_text(value, fallback=""):
    items = stringify_list(value)
    return items[0] if items else fallback


def normalize_row(row):
    name = str(row.get("name") or row.get("title") or row.get("game") or row.get("id") or "untitled game").strip()
    raw_slug = row.get("slug") or name
    slug = slugify(raw_slug, "game")
    genres = stringify_list(row.get("genres"))
    platforms = stringify_list(row.get("platforms"))
    tags = stringify_list(row.get("tags"))
    developers = stringify_list(row.get("developers"))
    publishers = stringify_list(row.get("publishers"))
    category = segment(first_text(genres, "uncategorized"), "uncategorized")
    subcategory = segment(first_text(platforms, "general"), "general")
    description = str(row.get("description") or f"{name} profile from the RAWG dataset.").strip()
    profile = {
        "id": str(row.get("id") or slug),
        "slug": slug,
        "name": name,
        "category": category,
        "subcategory": subcategory,
        "cost": row.get("cost") if row.get("cost") is not None else None,
        "timeToPlay": row.get("playtime") if row.get("playtime") is not None else row.get("timeToPlay"),
        "description": description,
        "timeline": default_timeline(category),
        "source": f"hf:{DATASET_ID}",
        "sourceId": row.get("id"),
        "sourceUrl": f"https://rawg.io/games/{slug}",
        "released": row.get("released"),
        "rating": row.get("rating"),
        "metacritic": row.get("metacritic"),
        "genres": genres,
        "platforms": platforms,
        "tags": tags,
        "developers": developers,
        "publishers": publishers,
    }
    return profile


def download_file(url, target):
    with requests.get(url, stream=True, timeout=120) as response:
        response.raise_for_status()
        with open(target, "wb") as handle:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    handle.write(chunk)


def ensure_file(handle_path):
    Path(handle_path).parent.mkdir(parents=True, exist_ok=True)


def load_dataset_files():
    meta = requests.get(f"https://huggingface.co/api/datasets/{DATASET_ID}", timeout=60).json()
    files = [s["rfilename"] for s in meta.get("siblings", []) if str(s.get("rfilename", "")).endswith(".parquet")]
    return files


def write_jsonl(path, rows):
    ensure_file(path)
    with open(path, "a", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=True) + "\n")


def read_index(path):
    if not path.exists():
        return {
            "version": 1,
            "chunkSize": CHUNK_SIZE,
            "recordCount": 0,
            "sourceCount": 0,
            "sources": {},
            "chunks": [],
        }
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def write_index(path, index):
    index["updatedAt"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    index["chunkSize"] = CHUNK_SIZE
    ensure_file(path)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(index, handle, indent=2, ensure_ascii=True)
        handle.write("\n")


def reset_existing_rawg_outputs(games_root, publish_root, sources_root, index_path):
    for directory in (
        games_root / "chunks",
        publish_root / "chunks",
    ):
        if not directory.exists():
            continue
        for file in directory.glob("rawg-*.jsonl"):
            file.unlink()

    manifest = sources_root / "import-manifest.json"
    if manifest.exists():
        manifest.unlink()

    if not index_path.exists():
        return

    index = read_index(index_path)
    index["chunks"] = [chunk for chunk in index.get("chunks", []) if not str(chunk.get("path", "")).startswith("chunks/rawg-")]
    index.get("sources", {}).pop("rawg_hf", None)
    index["recordCount"] = sum(int(chunk.get("count", 0)) for chunk in index.get("chunks", []))
    index["sourceCount"] = sum(int(source.get("imported", 0)) for source in index.get("sources", {}).values())
    write_index(index_path, index)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    root = Path(args.root)
    games_root = root / "games" / "rawg"
    publish_root = root / "publish-games"
    sources_root = root / "sources" / "rawg"
    index_path = publish_root / "index.json"

    games_root.mkdir(parents=True, exist_ok=True)
    publish_root.mkdir(parents=True, exist_ok=True)
    (sources_root / "chunks").mkdir(parents=True, exist_ok=True)
    reset_existing_rawg_outputs(games_root, publish_root, sources_root, index_path)

    source_files = load_dataset_files()
    limit = args.limit if args.limit and args.limit > 0 else math.inf
    imported = 0
    chunk_rows = []
    chunk_index = 1
    index = read_index(index_path)
    index["chunks"] = index.get("chunks", [])

    temp_dir = Path(tempfile.mkdtemp(prefix="nexusrealtime-rawg-"))
    try:
        for source_file in source_files:
            parquet_url = f"https://huggingface.co/datasets/{DATASET_ID}/resolve/main/{source_file}"
            local_file = temp_dir / Path(source_file).name
            print(f"Downloading {source_file}...", flush=True)
            download_file(parquet_url, local_file)
            pf = pq.ParquetFile(local_file)
            for batch in pf.iter_batches(batch_size=1000):
                table = batch.to_pydict()
                rows_in_batch = len(next(iter(table.values()))) if table else 0
                for i in range(rows_in_batch):
                    if imported >= limit:
                        break
                    row = {key: value[i] for key, value in table.items()}
                    profile = normalize_row(row)
                    chunk_rows.append(profile)
                    imported += 1
                    if len(chunk_rows) >= CHUNK_SIZE:
                        chunk_name = f"rawg-{str(chunk_index).zfill(4)}.jsonl"
                        games_path = games_root / "chunks" / chunk_name
                        publish_path = publish_root / "chunks" / chunk_name
                        write_jsonl(games_path, chunk_rows)
                        write_jsonl(publish_path, chunk_rows)
                        index["chunks"].append({"path": f"chunks/{chunk_name}", "count": len(chunk_rows)})
                        index["recordCount"] += len(chunk_rows)
                        print(f"Wrote chunk {chunk_index}: {games_path} ({len(chunk_rows)} rows)", flush=True)
                        chunk_index += 1
                        chunk_rows = []
                if imported >= limit:
                    break
            if imported >= limit:
                break

        if chunk_rows:
            chunk_name = f"rawg-{str(chunk_index).zfill(4)}.jsonl"
            games_path = games_root / "chunks" / chunk_name
            publish_path = publish_root / "chunks" / chunk_name
            write_jsonl(games_path, chunk_rows)
            write_jsonl(publish_path, chunk_rows)
            index["chunks"].append({"path": f"chunks/{chunk_name}", "count": len(chunk_rows)})
            index["recordCount"] += len(chunk_rows)
            print(f"Wrote chunk {chunk_index}: {games_path} ({len(chunk_rows)} rows)", flush=True)
            chunk_rows = []

        index["sources"]["rawg_hf"] = {
            "imported": imported,
            "chunkSize": CHUNK_SIZE,
            "dataset": DATASET_ID,
            "files": source_files,
        }
        index["sourceCount"] = index.get("sourceCount", 0) + imported
        write_index(index_path, index)

        manifest = {
            "dataset": DATASET_ID,
            "sourceFiles": source_files,
            "imported": imported,
            "chunkSize": CHUNK_SIZE,
        }
        with open(sources_root / "import-manifest.json", "w", encoding="utf-8") as handle:
            json.dump(manifest, handle, indent=2, ensure_ascii=True)
            handle.write("\n")

        print(json.dumps(manifest, indent=2), flush=True)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
