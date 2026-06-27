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

## Required secret for Discord

```text
DISCORD_WEBHOOK_URL
```

## Required secret for model-backed runs

```text
HF_MODEL_URL
```

Use a direct `.gguf` file URL from a Qwen3.5-2B GGUF repository.

## Optional secret

```text
HF_TOKEN
```

Use this only if Hugging Face requires authentication or rate-limit relief.
