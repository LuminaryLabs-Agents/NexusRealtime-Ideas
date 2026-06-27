# CascadeSeeder Live Monitor

This folder contains the temporary live monitor used by the GitHub Actions workflow.

## Behavior

- Starts a local HTTP monitor on port 8080.
- Starts a temporary Cloudflare Quick Tunnel to that local monitor.
- Posts `Live session visible here: <url>` to Discord when `DISCORD_WEBHOOK_URL` is configured.
- Serves `state.json`, `events.jsonl`, and `full-run-log.md` while the workflow runner is alive.
- The public link stops working when the GitHub Actions runner exits.

## Required secret for Discord

```text
DISCORD_WEBHOOK_URL
```

## Required variable for model-backed runs

```text
HF_MODEL_URL
```

Use a direct `.gguf` file URL from a Qwen3.5-2B GGUF repository.

## Optional secret

```text
HF_TOKEN
```

Use this only if Hugging Face requires authentication or rate-limit relief.
