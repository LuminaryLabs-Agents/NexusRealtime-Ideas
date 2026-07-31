# Agent Instructions

## Purpose

Use this repository to research, catalogue, validate, and route NexusRealtime ideas. Keep implementation in its owning runtime, ProtoKit, or experiment repository.

## Required read order

1. `.agent/START_HERE.md`
2. `.agent/repository-profile.md`
3. `.agent/current-state.md`
4. `.agent/workflow.md`
5. `.agent/pointer.md`
6. `scopes/README.md`

For lane work, also read `.agent/scheduled/scheduler-rules.md`, the assigned saved state, its lane folder, and the matching scope folder.

## Operating rules

- Scope is always a folder.
- Make one bounded change at a time.
- Default to catalogue-only work.
- Require `Builder status: ready` before builder work.
- Do not create scheduled tasks without explicit instruction.
- Do not claim promotion readiness without a candidate packet and proof notes.
- Keep secrets, tokens, private URLs, model files, and local absolute paths out of tracked artifacts.
- Treat generated output and historical audit records as evidence to review, not automatic truth.

## Data safety

The corpus is large and several commands mutate tracked JSONL files. Preview a bounded scope before a full run. Do not run imports, feedback fixes, kit generation, or CascadeSeeder merely to test documentation.

For documentation-only work, change only root documentation, `.agent/**`, and `docs/**`. Do not modify source, workflows, manifests, datasets, or generated catalogue output.

## Handoff

Record the command, affected scope, result, and unresolved issues in the lane required by `.agent/START_HERE.md`. Keep observed facts separate from plans and unknowns.
