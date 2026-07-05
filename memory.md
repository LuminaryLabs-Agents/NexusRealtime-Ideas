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
- Keep manual per-game JSON profiles under `games/`; large source imports may use chunked JSONL under `games/<source>/chunks/`.
- Keep source intake notes and manifests under `sources/`.
- Keep generated or publish-ready game-list output under `publish-games/` in chunked files capped at 5000 rows.
- Split oversized folders by the most informative subcategory fields available.
- Keep audit output and fixable issues under `feedback/`.
- When feedback points at JSONL shards, include a `line` number so the fix pass can repair the exact record in place.
- Keep kit-idea tracking state and generated packet runs under `ideas/kit-ideas/`.
- Mirror kit idea packets into `ideas/domain-packets/<domain>/<subdomain>/<game-slug>/<run-id>/`.
- Keep Codex CLI loop catalogs under `ideas/CodexIdea-Harness/` for repeatable extraction, generation, RAWG batch handoff, consumed-record advancement, and repair runs.
- Mark processed game profiles with `kitIdeasTracked` before moving on to the next untracked entry.
- Use a validator pass before accepting generated JSON profiles.
- Prefer small, bounded idea records over broad unlabeled notes.
