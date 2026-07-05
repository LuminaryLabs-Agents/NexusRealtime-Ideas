# Ideas

Idea folders move through this lifecycle:

```text
intake -> generated-runs -> processed | rejected | archived
```

`CascadeSeeder Lite FolderWalker` reads every folder under `ideas/intake/` and adds one fresh seed idea per run.

## Kit Ideas

`ideas/kit-ideas/` tracks unprocessed game profiles and stores the kit idea packets generated from them.

## Domain Packets

`ideas/domain-packets/` stores the generated packets by domain, then subdomain, then game, then run.

## Harnesses

`ideas/CodexIdea-Harness/` stores the Codex CLI loop catalog for repeatable extraction and packet-generation runs.
