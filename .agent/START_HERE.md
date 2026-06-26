# NexusRealtime Ideas Agent Start Here

`.agent/` is the repo-local source of truth for agent work in `NexusRealtime-Ideas`.

## Read order

1. Read `.agent/START_HERE.md`.
2. Read `.agent/current-state.md`.
3. Read `.agent/workflow.md`.
4. Read `.agent/pointer.md`.
5. Read `scopes/README.md`.
6. If the turn is scheduled-lane work, read `.agent/scheduled/scheduler-rules.md` and the matching `.agent/scheduled/saved-state-{index}.md`.
7. Make one bounded change.
8. Record the result in `.agent/run-log.md`, `.agent/turn-ledger/`, and lane-local notes when applicable.

## Operating rule

This repo thinks in folders.

A scope that is not represented by a folder is not considered stable repo knowledge.

## Repo boundary

Allowed here: domain catalogue, idea discovery, saved-state worker memory, candidate packets, builder queues, promotion review notes.

Not allowed here: stable runtime implementation, ProtoKit implementation, Experiment route implementation, or scheduled task creation unless explicitly requested.
