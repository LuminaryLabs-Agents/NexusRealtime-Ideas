# feedback

This folder stores audit output, shard review notes, and fixable issues from the game-profile CLI.

## Layout

- `feedback/runs/<run-id>/summary.md`
- `feedback/runs/<run-id>/summary.json`
- `feedback/runs/<run-id>/issues.jsonl`
- JSONL shard issues may include `line` so the fix pass can repair a specific record in a chunk.

## Rule

- Review every shard.
- Log problems here before applying fixes.
- Use the fix pass to clear the feedback queue after review.
