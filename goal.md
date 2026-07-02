# Goal

## Objective

Use GPT It as a repeatable source-and-expand loop for large lists of 1000 items.

## Intended flow

1. Start from a prior list or a prior seed list.
2. Ask GPT It to generate or extend a new list of 1000 distinct items.
3. Accumulate the resulting items across runs so the catalogue grows over time.
4. Store publish-ready outputs in `publish-games/`.

## Success criteria

- Each run can be traced back to a prior list or source list.
- New lists are distinct enough to add value, not just duplicates.
- Output artifacts are easy to publish from `publish-games/`.
- The repo keeps the process folder-driven instead of scattering outputs.
