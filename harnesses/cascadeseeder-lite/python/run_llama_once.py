#!/usr/bin/env python3
"""Download a GGUF model, build llama.cpp, run one prompt, and write CascadeSeeder model output."""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path.cwd()
RUNTIME = ROOT / ".agent" / "runtime"
RUN_ID_FILE = RUNTIME / "cascadeseeder-run-id"
PROMPT_FILE = RUNTIME / "cascadeseeder-prompt.md"
OUTPUT_FILE = RUNTIME / "cascadeseeder-model-output.txt"
MODEL_LOG = RUNTIME / "llama-run-log.md"
RUNNER_TEMP = Path(os.environ.get("RUNNER_TEMP", str(ROOT / ".tmp")))
RUN_ID = os.environ.get("CASCADESEEDER_RUN_ID") or (RUN_ID_FILE.read_text().strip() if RUN_ID_FILE.exists() else f"manual-{int(time.time())}-cascadeseeder-lite")
RUN_DIR = ROOT / "ideas" / "generated-runs" / RUN_ID
REQUIRE_MODEL = os.environ.get("REQUIRE_MODEL", "false").lower() == "true"


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def append_log(lines: list[str], text: str) -> None:
    lines.append(f"- {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())} {text}")


def run_cmd(cmd: list[str], lines: list[str], label: str, timeout: int | None = None) -> subprocess.CompletedProcess[str]:
    append_log(lines, f"start {label}: {' '.join(cmd[:3])}{' ...' if len(cmd) > 3 else ''}")
    start = time.time()
    result = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True, timeout=timeout)
    append_log(lines, f"end {label}: return_code={result.returncode} duration_seconds={time.time() - start:.1f} stdout_bytes={len(result.stdout)} stderr_bytes={len(result.stderr)}")
    if result.stdout:
        append_log(lines, f"{label} stdout tail: {result.stdout[-500:].replace(chr(10), ' ')}")
    if result.stderr:
        append_log(lines, f"{label} stderr tail: {result.stderr[-500:].replace(chr(10), ' ')}")
    return result


def finish(lines: list[str], code: int = 0) -> None:
    text = "# llama.cpp Run Log\n\n" + "\n".join(lines) + "\n"
    write(MODEL_LOG, text)
    write(RUN_DIR / "llama-run-log.md", text)
    if code and REQUIRE_MODEL:
        sys.exit(code)
    sys.exit(0)


def main() -> None:
    lines: list[str] = []
    RUNTIME.mkdir(parents=True, exist_ok=True)
    RUN_DIR.mkdir(parents=True, exist_ok=True)
    append_log(lines, f"run_id={RUN_ID}")
    append_log(lines, f"require_model={REQUIRE_MODEL}")

    model_url = os.environ.get("HF_MODEL_URL", "").strip()
    hf_token = os.environ.get("HF_TOKEN", "").strip()
    append_log(lines, f"hf_model_url_configured={bool(model_url)}")
    append_log(lines, f"hf_token_configured={bool(hf_token)}")

    if not PROMPT_FILE.exists():
        append_log(lines, f"missing prompt file: {PROMPT_FILE}")
        finish(lines, 2)
    if not model_url:
        append_log(lines, "HF_MODEL_URL missing; skipping model run and allowing Node fallback")
        finish(lines, 0)

    model_dir = RUNNER_TEMP / "cascadeseeder-model"
    llama_dir = RUNNER_TEMP / "llama.cpp"
    model_path = model_dir / "model.gguf"
    model_dir.mkdir(parents=True, exist_ok=True)

    curl = shutil.which("curl")
    if not curl:
        append_log(lines, "curl missing")
        finish(lines, 3)

    curl_cmd = [curl, "-L", "--retry", "3", "--retry-delay", "5"]
    if hf_token:
        curl_cmd += ["-H", "Authorization: Bearer " + hf_token]
    curl_cmd += [model_url, "-o", str(model_path)]
    download = run_cmd(curl_cmd, lines, "download-model", timeout=1800)
    if download.returncode != 0 or not model_path.exists() or model_path.stat().st_size <= 0:
        append_log(lines, f"model download failed or empty: exists={model_path.exists()} size={model_path.stat().st_size if model_path.exists() else 0}")
        finish(lines, download.returncode or 4)
    append_log(lines, f"model_path={model_path}")
    append_log(lines, f"model_size_bytes={model_path.stat().st_size}")

    if llama_dir.exists():
        shutil.rmtree(llama_dir)
    clone = run_cmd(["git", "clone", "--depth", "1", "https://github.com/ggml-org/llama.cpp", str(llama_dir)], lines, "clone-llama", timeout=900)
    if clone.returncode != 0:
        finish(lines, clone.returncode)
    build_dir = llama_dir / "build"
    configure = run_cmd(["cmake", "-S", str(llama_dir), "-B", str(build_dir), "-DGGML_NATIVE=OFF", "-DCMAKE_BUILD_TYPE=Release"], lines, "cmake-configure", timeout=900)
    if configure.returncode != 0:
        finish(lines, configure.returncode)
    build = run_cmd(["cmake", "--build", str(build_dir), "--config", "Release", "-j", "2", "--target", "llama-cli"], lines, "cmake-build", timeout=1800)
    if build.returncode != 0:
        finish(lines, build.returncode)

    candidates = [build_dir / "bin" / "llama-cli", build_dir / "bin" / "Release" / "llama-cli", build_dir / "llama-cli"]
    llama_cli = next((p for p in candidates if p.exists()), None)
    if not llama_cli:
        append_log(lines, "llama-cli not found after build")
        finish(lines, 5)
    append_log(lines, f"llama_cli={llama_cli}")

    prompt = PROMPT_FILE.read_text(encoding="utf-8")
    append_log(lines, f"prompt_chars={len(prompt)}")
    cmd = [
        str(llama_cli),
        "-m", str(model_path),
        "-p", prompt,
        "-n", os.environ.get("LLAMA_N_PREDICT", "900"),
        "--temp", os.environ.get("LLAMA_TEMP", "0.7"),
        "--ctx-size", os.environ.get("LLAMA_CTX_SIZE", "4096"),
        "-t", os.environ.get("LLAMA_THREADS", "2"),
    ]
    inference = run_cmd(cmd, lines, "llama-inference", timeout=1800)
    combined = inference.stdout + "\n\n--- llama.cpp stderr ---\n" + inference.stderr
    write(OUTPUT_FILE, combined)
    write(RUN_DIR / "raw-model-output.txt", combined)
    append_log(lines, f"model_output_path={OUTPUT_FILE}")
    append_log(lines, f"model_output_bytes={len(combined.encode('utf-8'))}")
    finish(lines, inference.returncode)


if __name__ == "__main__":
    main()
