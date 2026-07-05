# Goal

## Objective

Use GPT It as a repeatable source-and-expand loop for large lists of 1000 items.
The repo should split raw game profiles into `games/` and publish-ready exports into `publish-games/`.
No single file in the export layer should exceed `5000` entries.
The CLI needs an audit pass, a validator pass, and a feedback-fix pass.
Use a traceable source intake layer under `sources/`, currently centered on RAWG.

## Intended flow

1. Start from a prior list or a prior seed list.
2. Ask GPT It to generate or extend a new list of 1000 distinct items.
3. Accumulate the resulting items across runs so the catalogue grows over time.
4. Store individual game profile JSON files in `games/`.
5. Store publish-ready outputs in `publish-games/`.
6. Keep export chunks at `5000` rows or fewer and split large folders by subcategory.
7. Audit every shard, write issues to `feedback/`, and fix the feedback before promotion.
8. Record source intake under `sources/` and use RAWG for the large existing-game ingest path.
9. Track each processed game profile in `ideas/kit-ideas/` and generate kit idea packets for the untracked queue.

## Success criteria

- Each run can be traced back to a prior list or source list.
- New lists are distinct enough to add value, not just duplicates.
- Output artifacts are easy to publish from `publish-games/`.
- One JSON file per game exists in `games/` with the profile fields and timeline.
- Any export chunk stays under the `5000` entry cap.
- The audit/validate/fix loop exists and is usable from the CLI.
- Source intake is traceable and can support a 200k+ RAWG import.
- The repo keeps the process folder-driven instead of scattering outputs.
- Kit-idea runs are tracked per game and stored as packet folders under `ideas/kit-ideas/`.
