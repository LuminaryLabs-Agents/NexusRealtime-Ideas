# Repository Profile

## Purpose

`NexusRealtime-Ideas` is the folder-driven research, catalogue, and candidate-packet workspace for NexusRealtime. It converts source game records and domain observations into validated, reviewable idea packets and builder queues.

## Boundaries

Owns: scoped domain thinking, source records, feedback, packet evidence, promotion notes, and agent catalogue state.

Does not own: stable runtime code, ProtoKit implementation, playable routes, or automatic promotion decisions.

## Current recorded state

- Default branch: `main`
- Automation branch: `build`
- Runtime requirement: Node.js 20 or newer
- Recorded corpus: 881,069 RAWG-derived profiles in 177 chunks
- Recorded packet state: four runs and 480 packets
- Scheduled workers: planned but inactive

## Durable conventions

- Scope is always a folder.
- Catalogue mode is the default.
- Builder work requires an explicit ready state.
- Historical reports are evidence for their recorded revision, not guarantees about current data.
- Large or mutating operations require explicit intent and bounded review.

## Entry points

- Public orientation: `README.md`
- Agent workflow: `.agent/START_HERE.md`
- Current next action: `.agent/pointer.md`
- Architecture and contracts: `docs/`
- Domain cascade: `scopes/`
