# Scheduled Worker Layer

This folder defines the future 12-worker scheduler architecture.

Scheduled tasks are not active yet.

Each future task reads one `saved-state-{index}.md`, works inside one lane, writes lane-local catalogue output, updates its saved state, and stops.

## Worker count

```text
01 pressure/resource
02 action/affordance
03 route/progress
04 route/cargo/extraction
05 defense/boundaries
06 defense/bridges
07 vertical/climb
08 arcade/race
09 open/world/flight
10 render/descriptors
11 spatial/platformer
12 global/aggregator
```
