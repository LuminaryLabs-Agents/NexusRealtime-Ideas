# KitIdeaRegistry Validation

## Proof Ladder

1. headless unit test: `buildKitIdeaPackets()` returns deterministic packets for the same game profile and count.
2. smoke test: `node scripts/game-profile-cli.mjs kit-ideas-next --count 1` returns one untracked profile.
3. deterministic snapshot: the same input profile always yields the same first packet name and core reuse map.
4. reset/replay check: rerunning generation on the same profile skips it after the tracked flag is set.
5. package/export check: the kit package exports `createKitIdeaRegistryKit()` and `buildKitIdeaPackets()`.
6. manual verification: inspect the generated run folder under `ideas/kit-ideas/runs/` and the mirrored domain packet folder under `ideas/domain-packets/`.

## Snapshot Expectations

- serializable: yes
- deterministic: yes for a fixed input profile and packet count
- stable after reset: yes because the kit is stateless

## Idempotency Checks

- repeated install: returns the same engine without duplicating state
- repeated init: reusing the CLI does not duplicate tracked profiles
- repeated reset: no effect beyond returning the engine unchanged
- duplicate event prevention: a tracked profile is skipped on the next run

## Current Status

Validated by the CLI generator path and the tracked-flag update flow.
