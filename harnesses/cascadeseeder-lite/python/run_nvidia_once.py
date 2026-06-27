#!/usr/bin/env python3
"""Run CascadeSeeder prompt through NVIDIA NIM chat completions once."""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path.cwd()
RUNTIME = ROOT / ".agent" / "runtime"
RUN_ID_FILE = RUNTIME / "cascadeseeder-run-id"
PROMPT_FILE = RUNTIME / "cascadeseeder-prompt.md"
OUTPUT_FILE = RUNTIME / "cascadeseeder-model-output.txt"
NVIDIA_LOG = RUNTIME / "nvidia-run-log.md"
RUN_ID = os.environ.get("CASCADESEEDER_RUN_ID") or (RUN_ID_FILE.read_text().strip() if RUN_ID_FILE.exists() else f"manual-{int(time.time())}-cascadeseeder-lite")
RUN_DIR = ROOT / "ideas" / "generated-runs" / RUN_ID
REQUIRE_MODEL = os.environ.get("REQUIRE_MODEL", "false").lower() == "true"


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def append_log(lines: list[str], text: str) -> None:
    lines.append(f"- {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())} {text}")


def finish(lines: list[str], code: int = 0) -> None:
    text = "# NVIDIA NIM Run Log\n\n" + "\n".join(lines) + "\n"
    write(NVIDIA_LOG, text)
    write(RUN_DIR / "nvidia-run-log.md", text)
    if code and REQUIRE_MODEL:
        sys.exit(code)
    sys.exit(0)


def main() -> None:
    lines: list[str] = []
    RUNTIME.mkdir(parents=True, exist_ok=True)
    RUN_DIR.mkdir(parents=True, exist_ok=True)

    api_key = os.environ.get("NVIDIA_API_KEY", "").strip()
    base_url = os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1").rstrip("/")
    model = os.environ.get("NVIDIA_MODEL", "minimaxai/minimax-m3").strip()
    max_tokens = int(os.environ.get("NVIDIA_MAX_TOKENS", "4096"))
    temperature = float(os.environ.get("NVIDIA_TEMPERATURE", "0.7"))
    top_p = float(os.environ.get("NVIDIA_TOP_P", "0.95"))
    timeout_seconds = int(os.environ.get("NVIDIA_TIMEOUT_SECONDS", "120"))

    append_log(lines, f"run_id={RUN_ID}")
    append_log(lines, f"require_model={REQUIRE_MODEL}")
    append_log(lines, f"nvidia_api_key_configured={bool(api_key)}")
    append_log(lines, f"nvidia_base_url={base_url}")
    append_log(lines, f"nvidia_model={model}")
    append_log(lines, f"max_tokens={max_tokens}")
    append_log(lines, f"temperature={temperature}")
    append_log(lines, f"top_p={top_p}")

    if not PROMPT_FILE.exists():
        append_log(lines, f"missing prompt file: {PROMPT_FILE}")
        finish(lines, 2)
    if not api_key:
        append_log(lines, "NVIDIA_API_KEY missing; skipping NVIDIA provider")
        finish(lines, 0)

    prompt = PROMPT_FILE.read_text(encoding="utf-8")
    append_log(lines, f"prompt_chars={len(prompt)}")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Return strict JSON only. Do not wrap output in markdown."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": top_p,
        "stream": False,
    }

    url = base_url + "/chat/completions"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
            raw = response.read().decode("utf-8", errors="replace")
            status = response.status
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        append_log(lines, f"http_error status={exc.code} duration_seconds={time.time() - start:.1f} body_tail={raw[-800:]}")
        finish(lines, exc.code or 3)
    except Exception as exc:
        append_log(lines, f"request_error type={type(exc).__name__} message={exc}")
        finish(lines, 4)

    append_log(lines, f"response_status={status}")
    append_log(lines, f"duration_seconds={time.time() - start:.1f}")
    append_log(lines, f"raw_response_bytes={len(raw.encode('utf-8'))}")

    try:
        parsed = json.loads(raw)
        content = parsed["choices"][0]["message"]["content"]
    except Exception as exc:
        append_log(lines, f"parse_error type={type(exc).__name__} message={exc}")
        content = raw

    combined = content + "\n\n--- nvidia raw response ---\n" + raw
    write(OUTPUT_FILE, combined)
    write(RUN_DIR / "raw-model-output.txt", combined)
    append_log(lines, f"model_output_path={OUTPUT_FILE}")
    append_log(lines, f"model_output_bytes={len(combined.encode('utf-8'))}")
    finish(lines, 0)


if __name__ == "__main__":
    main()
