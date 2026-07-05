# CodexIdea-Harness

Root harness for linear idea-processing loops that should be driven by Codex CLI instead of chat.

## Purpose

- discover the next unprocessed record
- extract reusable domains and kit candidates
- generate tracked packet runs
- mirror packets into domain-shaped folders
- audit, validate, and consume the record
- hand off RAWG batch selection and consumed-state tracking to the NexusRealtime-Automations GameRecordBatch-Harness

## Tool Set

- `scan-next`
- `extract-domains`
- `generate-packets`
- `consume-record`
- `prepare-rawg-batch`
- `advance-rawg-batch`
- `mirror-domain-packets`
- `audit-shards`
- `validate-packets`
- `repair-feedback`

## Storage

- `ideas/CodexIdea-Harness/tool-catalog.json`
- `ideas/CodexIdea-Harness/commands.md`
- `ideas/CodexIdea-Harness/runs/`

## Rule

- Keep this harness focused on repeatable loops that Codex CLI can run without discussion.
- If a loop becomes stable, move it from chat-driven work into a harness command.
