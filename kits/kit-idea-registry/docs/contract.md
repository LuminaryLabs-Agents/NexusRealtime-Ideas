# KitIdeaRegistry Contract

## Domain Ownership

- domain: `game-kit-ideas`
- kind: `domain-service`

## Owns

- state:
- resources:
- events:
- surfaces:
- run folders under `ideas/kit-ideas/runs/`
- tracked ledger at `ideas/kit-ideas/tracked.jsonl`
- domain packet mirror under `ideas/domain-packets/<domain>/<subdomain>/<game-slug>/<run-id>/`

## Accepts

- inputs:
- game profile records from `games/`
- packet count overrides for run generation
- config:
- `count`
- `packets`

## Installs

- systems:
- tracker scan
- packet generation
- tracked-flag update
- domain packet mirror writer
- scheduler phases:

## Publishes

- engine API:
- `engine.n.gameKitIdeas`
- snapshots:
- run summary objects
- reset:
- clears transient run state only

## Composes

- required kits:
- `core-data-kit`
- `core-diagnostics-kit`
- optional kits:
- `core-composition-kit`
- nested kits:
- none yet

## Boundaries

- belongs in this kit:
- identifying untracked games
- generating 100+ packet ideas per game
- writing packet runs and tracked ledgers
- mirroring packets into domain/subdomain folders
- belongs in host/app shell:
- manual approval to batch-generate thousands of packets
- belongs in renderer adapter:
- nothing
- belongs in proof harness:
- file-count checks

## Example Input

```json
{
  "gameProfile": {
    "id": "rawg-3328",
    "slug": "hades",
    "name": "Hades",
    "category": "action-rpg",
    "subcategory": "pc"
  },
  "count": 1,
  "packets": 120
}
```

## Example Output

```json
{
  "runId": "kit-ideas-2026-07-02T11-40-00-000Z",
  "trackedCount": 1,
  "packetTotal": 120
}
```

## Example Proof

```txt
node scripts/game-profile-cli.mjs kit-ideas-generate --count 1 --packets 120
```
