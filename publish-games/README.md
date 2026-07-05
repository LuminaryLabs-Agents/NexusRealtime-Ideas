# publish-games

This folder is the publish-ready output sink for accumulated game-list artifacts.

Use it for generated lists, cleaned exports, and any final handoff files that are meant to be published or reused.

## File cap

- Keep every export chunk at `5000` records or fewer.
- Use chunked JSONL files under `publish-games/chunks/`.
