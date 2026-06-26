# Scheduler Rules

## Global rule

The scheduler is folder-driven.

Every worker must pick up from its `saved-state-{index}.md`.

## Required read set

1. `.agent/START_HERE.md`
2. `.agent/current-state.md`
3. `.agent/workflow.md`
4. `.agent/scheduled/scheduler-rules.md`
5. `.agent/scheduled/saved-state-{index}.md`
6. The current lane folder under `.agent/scheduled/lanes/`
7. The matching scope folder under `scopes/`

## Allowed writes for workers 01-11

- Their own saved-state file.
- Their own lane folder.
- `.agent/turn-ledger/`.
- Their matching `scopes/` child folder.

## Allowed writes for worker 12

- `.agent/scheduled/global-catalog-index.md`
- `.agent/scheduled/global-blockers.md`
- `.agent/current-state.md`
- `.agent/turn-ledger/`

## Builder gate

Catalogue mode is default.

Builder mode requires `Builder status: ready` inside the saved-state file.
