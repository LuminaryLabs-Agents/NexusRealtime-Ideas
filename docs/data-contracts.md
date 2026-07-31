# Data Contracts

## Game profile

The current validator requires:

| Field | Requirement |
| --- | --- |
| `name` | Non-empty text |
| `slug` | Non-empty text |
| `category` | Non-empty text |
| `subcategory` | Non-empty text |
| `description` | Non-empty text |
| `timeline` | Non-empty array |
| `timeline[].step` | Numeric value |
| `timeline[].label` | Non-empty text |

Writers may add `id`, cost, play time, source metadata, timestamps, tags, developers, publishers, and tracking fields. The normalizer preserves unknown input fields, so consumers must tolerate extensions.

The validator checks structure, not factual accuracy, uniqueness, source rights, or timeline quality.

## Storage layouts

Small profiles may use:

```text
games/<category>/<subcategory>/<shard>/<slug>/game.json
```

Large imports use line-addressable JSONL:

```text
games/<source>/chunks/<chunk>.jsonl
publish-games/chunks/<chunk>.jsonl
```

`publish-games/index.json` records version, chunk size, counts, source metadata, and chunk paths. The repository policy caps a publish chunk at 5,000 records.

## Feedback runs

```text
feedback/runs/<run-id>/
  summary.json
  summary.md
  issues.jsonl
```

An issue identifies `field`, `issue`, and `fix`. JSONL findings also include a one-based `line` and shard context when available. The repair command only handles its documented missing-field and malformed-timeline cases.

## Kit-idea tracking

Packet generation writes:

```text
ideas/kit-ideas/runs/<run-id>/<game>/
  profile.json
  summary.json
  status.md
  packets.jsonl
```

It also appends a tracking record to `ideas/kit-ideas/tracked.jsonl` and mirrors packets to:

```text
ideas/domain-packets/<domain>/<subdomain>/<game>/<run-id>/
```

A packet records identifiers, game context, kit name, domain, subdomain, kind, purpose, timing rationale, Core reuse, inputs, outputs, proof guidance, and tags. Packet generation is deterministic for the same profile and requested count, but a packet remains a proposal until reviewed.

## Compatibility limits

The repository does not currently publish JSON Schema files, a compatibility policy, or repository-wide uniqueness enforcement. Treat the current code and versioned indexes as the implemented contract, and document any breaking data change before changing producers or consumers.
