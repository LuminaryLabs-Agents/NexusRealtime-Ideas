# CascadeSeeder Live Monitor

This folder contains the temporary live monitor used by the GitHub Actions workflow.

## Behavior

- Starts a local HTTP monitor on port 8080.
- Starts a temporary Cloudflare Quick Tunnel to that local monitor.
- Posts `Live session visible here: <url>` to Discord when `DISCORD_WEBHOOK_URL` is configured.
- Serves `state.json`, `events.jsonl`, `full-run-log.md`, and `exit-status` while the workflow runner is alive.
- Includes an `Exit live monitor` button that asks the workflow to stop the post-run hold early.
- The public link stops working when the GitHub Actions runner exits.

## Trigger branch

The expensive live/model workflow runs from the `build` branch, not `main`.

```text
main = safe edit branch
build = live/model runner trigger branch
```

## Primary model provider

The workflow tries NVIDIA NIM first, then falls back to the existing llama.cpp/Hugging Face GGUF path only if no NVIDIA model output exists.

## Required secret for Discord

```text
DISCORD_WEBHOOK_URL
```

## Required secret for NVIDIA NIM

```text
NVIDIA_API_KEY
```

## NVIDIA defaults configured in workflow

```text
MODEL_PROVIDER=nvidia
NVIDIA_MODEL=minimaxai/minimax-m3
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MAX_TOKENS=4096
NVIDIA_TEMPERATURE=0.7
NVIDIA_TOP_P=0.95
NVIDIA_TIMEOUT_SECONDS=120
```

## Optional llama.cpp fallback secrets

```text
HF_MODEL_URL
HF_TOKEN
```

`HF_MODEL_URL` should be a direct `.gguf` file URL if you want the local llama.cpp fallback. `HF_TOKEN` is only needed if Hugging Face requires authentication or rate-limit relief.

## Workflow syntax note

Discord messages are posted through `post-discord.mjs` instead of inline Python heredocs so the workflow YAML remains valid.
