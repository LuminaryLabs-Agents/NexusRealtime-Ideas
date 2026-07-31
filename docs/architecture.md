# Architecture

## Purpose boundary

NexusRealtime Ideas is a research and promotion-planning repository. It discovers reusable needs and prepares evidence for builders; it does not implement stable runtime or playable products.

```text
External source
  -> sources/ provenance
  -> games/ source profiles
  -> publish-games/ bounded exports
  -> feedback/ audit findings
  -> ideas/kit-ideas/ tracked processing
  -> ideas/domain-packets/ reviewable candidate packets
  -> .agent/promotion/ builder handoff decisions
```

## Two complementary lanes

### Profile and packet lane

`scripts/game-profile-cli.mjs` reads profile records, validates required fields, writes feedback runs, and deterministically creates kit-idea packets through `kits/kit-idea-registry/`.

Source and publish copies are separate. Packet generation marks matching records as tracked and writes immutable-looking run folders, but the code does not provide transactional rollback. Review changes before commit.

### Folder-scoped discovery lane

`scopes/` is the durable domain taxonomy. CascadeSeeder Lite reads the current folder ontology and `ideas/intake/`, then writes generated-run evidence and scoped candidate folders. The `build` branch isolates automation output from ordinary edits on `main`.

```text
00-inbox
  -> 10-atomic-domains
  -> 20-domain-families
  -> 30-composite-loops
  -> 40-host-bridges
  -> 50-render-descriptors
  -> 60-incubation-suites
  -> 70-promotion-candidates
  -> 80-blocked-or-held
```

Movement through this list reflects a scope decision, not automatic maturity.

## State ownership

- `.agent/` owns current operating state, lane constraints, and handoff evidence.
- `sources/` owns import provenance.
- `games/` owns source profile records.
- `publish-games/` owns reusable export copies and their index.
- `feedback/` owns audit findings.
- `ideas/` owns generated ideas, tracking ledgers, and packet runs.
- `scopes/` owns domain placement and promotion posture.

Stable implementation remains outside this repository.

## Trust boundaries

External datasets, model output, and generated repair suggestions are untrusted inputs. Validators cover required profile structure, not semantic truth, uniqueness, licensing, or promotion readiness. Human or agent review must preserve provenance and distinguish recorded evidence from inferred conclusions.
