# Contributing

## Choose the correct repository

Contribute here when the result is catalogue knowledge, source intake, validation feedback, a candidate packet, or a builder-queue decision. Stable runtime code, ProtoKit implementation, and playable routes belong in their owning repositories.

## Prepare

1. Read [`AGENTS.md`](AGENTS.md) and [`.agent/START_HERE.md`](.agent/START_HERE.md).
2. Confirm the current scope folder and lane.
3. Check the working tree before editing.
4. Keep the change bounded to one purpose.

## Place work

- New unscoped ideas: `ideas/intake/<idea>/`
- Domain findings: the appropriate level under `scopes/`
- Source provenance: `sources/`
- Source profiles: `games/`
- Reusable exports: `publish-games/`
- Audit findings: `feedback/`
- Kit tracking and run output: `ideas/kit-ideas/`
- Domain packet mirrors: `ideas/domain-packets/`

Do not use a tag or prose-only note as the sole owner of scope.

## Validate

Use the smallest relevant check first. For a single JSONL shard:

```bash
node scripts/game-profile-cli.mjs validate --path games/rawg/chunks/rawg-0001.jsonl
```

The full audit and validation commands scan 881,069 recorded profiles and can produce large output. Commands such as `games:audit`, `games:fix`, `ideas:kit-generate`, imports, and CascadeSeeder mutate tracked files. Run them only when those changes are intended and review their artifacts before handoff.

## Submit

- Explain the source and scope of the change.
- List commands run and resulting evidence.
- Identify generated or modified data explicitly.
- Keep secrets and local machine paths out of commits.
- Label historical results, plans, and unknowns honestly.
