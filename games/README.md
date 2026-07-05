# games

This folder stores one JSON profile per real game.

## Layout

- Small manual entries may still use `games/<category>/<subcategory>/<shard>/<slug>/game.json`.
- Large source imports should use chunked JSONL shards under `games/<source>/<group>/chunk-00001.jsonl`.

## Profile shape

Each game profile should cover:

- `name`
- `cost`
- `timeToPlay`
- `description`
- `timeline`

## Timeline shape

Use a stepwise gameplay timeline with ordered entries such as:

- setup
- first action
- core loop
- escalation
- session end

## Relationship to publish output

- `games/` is the source store for individual game profiles.
- `publish-games/` is the publish-ready export layer built from those profiles.

## Split rule

- Never keep more than `5000` profile entries in a single export file.
- When a shard grows past `5000` items, split it by the most informative subcategory fields available in the profiles.

## Review loop

- Run the audit pass over every shard.
- Write issues into `feedback/`.
- Run the fix pass to fill gaps and normalize the shard after review.
