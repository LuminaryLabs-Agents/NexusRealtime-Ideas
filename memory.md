# Memory

## Purpose

`NexusRealtime-Ideas` is the folder-driven idea catalogue, saved-state, and builder-queue repo for the NexusRealtime ecosystem.

## Architecture shape

- `scopes/` holds the folder cascade for scoped idea work.
- `.agent/` holds repo-local operating truth, saved states, run logs, and lane instructions.
- This repo does not own stable runtime code or ProtoKit implementation.
- Ideas become durable only when they live inside a folder that states their scope.

## Major conventions

- Scope is always a folder.
- Keep catalogue work separate from runtime implementation.
- Do not create scheduled tasks unless explicitly requested.
- Keep generated or publish-ready game-list output under `publish-games/`.
- Prefer small, bounded idea records over broad unlabeled notes.
