# KitIdeaRegistry Kit

Track game profiles, generate 100+ NexusRealtime kit idea packets per unprocessed game, and write those packets into the repo-local kit ideas lane.

## Domain

- domain: `game-kit-ideas`
- kind: `domain-service`
- status: `experimental`

## Ownership

This kit owns the reusable `game-kit-ideas` domain behavior for the target repo. Keep host routing, browser APIs, DOM, Canvas, Three.js, asset loading, and app-shell wiring outside this kit unless this kit is explicitly a renderer adapter or host-support kit.

## Public Shape

- factory: `createKitIdeaRegistryKit()`
- descriptor: `kitIdeaRegistryKitDescriptor`
- packet builder: `buildKitIdeaPackets(gameProfile, { count })`
- expected promoted API: `engine.n.gameKitIdeas` when promoted or bridged

## Packet Storage

- tracking ledger: `ideas/kit-ideas/tracked.jsonl`
- queue runs: `ideas/kit-ideas/runs/<run-id>/`
- domain packets: `ideas/domain-packets/<domain>/<subdomain>/<game-slug>/<run-id>/`

## Nested Kits

- none yet

## Core Kit Reuse

- `core-data-kit`: keeps tracked flags, run summaries, and packet ledgers serializable.
- `core-diagnostics-kit`: keeps generation and proof output readable for review.
- `core-composition-kit`: supports future promotion if the registry is split into sub-kits later.

## Concrete Example

Example input:

```json
{
  "id": "rawg-3328",
  "slug": "hades",
  "name": "Hades",
  "category": "action-rpg",
  "subcategory": "pc",
  "source": "hf:IVproger/rawg-games-dataset-updated"
}
```

Example output:

```json
{
  "packetId": "hades-movement-control-01",
  "gameSlug": "hades",
  "kitName": "movement-control-kit",
  "subdomain": "movement-control",
  "kind": "atomic",
  "domain": "movement",
  "coreReuse": [
    "core-input-kit",
    "core-motion-kit",
    "core-spatial-kit",
    "core-data-kit",
    "core-diagnostics-kit"
  ]
}
```

Example install:

```ts
const kit = createKitIdeaRegistryKit();
engine = kit.install(engine);
engine = kit.install(engine); // idempotent
```

Example reset and snapshot:

```ts
engine = kit.reset(engine);
const snapshot = kit.snapshot(engine);
// snapshot -> { id: "kit-idea-registry", domain: "game-kit-ideas", status: "stateless" }
```

First proof:

```txt
node scripts/game-profile-cli.mjs kit-ideas-generate --count 1 --packets 120
```

## Contract Questions

- What state does this kit own?
- What inputs does it accept?
- What systems does it install?
- What events does it emit?
- What resources does it read and write?
- What surfaces does it publish?
- What kits does it require or compose with?
- How does it reset?
- How does it snapshot?
- What proves it works?

## Validation

Start with the smallest meaningful proof:

1. headless test for pure state
2. smoke test for composition
3. deterministic snapshot
4. reset/replay check
5. package/export check
6. documented manual verification when no automated path exists

The first practical repo proof is the CLI packet run above, which should create a tracked game folder under `ideas/kit-ideas/runs/` and append the tracked profile to `ideas/kit-ideas/tracked.jsonl`.
It should also mirror the generated packets into `ideas/domain-packets/` grouped by domain and subdomain.

## Promotion

Do not promote this kit until it is generic beyond one route or app, deterministic where required, reset/snapshot capable when stateful, tested or smoke-validated, and documented for humans and agents.
