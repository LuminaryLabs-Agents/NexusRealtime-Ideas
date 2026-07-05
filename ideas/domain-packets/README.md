# Domain Packets

This lane stores kit idea packets grouped by domain and subdomain.

## Layout

- `ideas/domain-packets/<domain>/<subdomain>/<game-slug>/<run-id>/packets.jsonl`
- `ideas/domain-packets/<domain>/<subdomain>/<game-slug>/<run-id>/summary.json`
- `ideas/domain-packets/index.json`

## Rule

- Keep packets grouped by domain first, then subdomain, then game, then run.
- Use this lane as the browsable packet library.
- Keep `ideas/kit-ideas/` as the tracking and queue ledger.
