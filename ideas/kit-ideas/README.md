# Kit Ideas

This lane tracks game profiles as they are processed into NexusRealtime kit idea packets.

## Layout

- `ideas/kit-ideas/index.json` keeps run counts and packet counts.
- `ideas/kit-ideas/tracked.jsonl` records each processed game profile.
- `ideas/kit-ideas/runs/<run-id>/<game-slug>/profile.json` stores the source profile snapshot.
- `ideas/kit-ideas/runs/<run-id>/<game-slug>/packets.jsonl` stores the generated kit idea packets.
- `ideas/kit-ideas/runs/<run-id>/<game-slug>/status.md` explains the tracked state and packet count.

## Workflow

1. Use `node scripts/game-profile-cli.mjs kit-ideas-next --count 5` to preview the next untracked games.
2. Use `node scripts/game-profile-cli.mjs kit-ideas-generate --count 1 --packets 120` to generate packets and mark the game profile as tracked.
3. Repeat until the untracked queue is empty.
4. Each generated run is mirrored into `ideas/domain-packets/<domain>/<subdomain>/<game-slug>/<run-id>/` for browsable domain storage.
