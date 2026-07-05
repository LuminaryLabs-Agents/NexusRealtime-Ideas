# Game Profile Storage Estimate

## Assumptions

- Target population: `200,000` existing games.
- One record per game.
- No cover art, screenshots, or binary blobs in the primary store.
- Store is append-friendly and publish-friendly.

## Compact profile

Example fields:

- `id`
- `title`
- `platform`
- `year`
- `genres`
- `source`
- `status`

Typical size:

- JSONL: about `150-350 bytes` per game.
- CSV: about `80-220 bytes` per game.
- Gzipped JSONL: about `3-6x` smaller than raw JSONL.

For `200,000` games:

- JSONL: about `30-70 MB`.
- CSV: about `16-44 MB`.
- Gzipped JSONL: about `8-25 MB`.

## Rich profile

Example fields:

- compact profile fields
- `summary`
- `tags`
- `developer`
- `publisher`
- `releaseDate`
- `notes`
- `relationships`

Typical size:

- JSONL: about `500-1,500 bytes` per game.
- CSV: usually awkward here because nested fields become string-heavy.

For `200,000` games:

- JSONL: about `100-300 MB`.
- Gzipped JSONL: about `20-80 MB`.

## Matrix-oriented store

If the CLI stores a numeric feature matrix alongside each profile:

- `128` float32 features per game: `200,000 * 128 * 4 = 102.4 MB` raw feature data.
- `256` float32 features per game: `200,000 * 256 * 4 = 204.8 MB` raw feature data.

That is just the numeric matrix, not the text profile.

## Practical recommendation

- Use `publish-games/index.json` for manifest and counts.
- Use chunked exports under `publish-games/chunks/` with a hard cap of `5000` rows per file.
- Use chunked source intake under `games/<source>/chunks/` for large imports so source shards stay reviewable.
- Keep numeric features in a separate matrix file only if the workflow truly needs them.
