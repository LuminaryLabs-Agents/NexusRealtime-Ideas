# NexusRealtime Ideas

NexusRealtime Ideas is the folder-driven planning, cataloguing, and domain-discovery repo for the NexusRealtime ecosystem.

This repo does **not** own stable runtime code, ProtoKit implementation, or playable experiment routes.

It owns structured thinking:

```text
idea -> scoped domain folder -> catalogue finding -> candidate packet -> builder queue -> ProtoKits review
```

## Core rule

**Scope is always a folder.**

Do not store important scope only as a tag, heading, issue label, or free-floating note.

Every meaningful idea must live under a folder that states its current scope.

## Repo roles

```text
NexusRealtime Core       = stable runtime and promoted contracts
NexusRealtime-ProtoKits  = reusable pre-Core domain kit implementation
NexusRealtime-Experiments = playable validation hosts
NexusRealtime-Ideas      = domain catalogue, exploration, saved states, and builder queues
```

## Start here

Read:

```text
.agent/START_HERE.md
.agent/workflow.md
.agent/current-state.md
scopes/README.md
```

## Folder-driven cascade

```text
scopes/
  00-inbox/
  10-atomic-domains/
  20-domain-families/
  30-composite-loops/
  40-host-bridges/
  50-render-descriptors/
  60-incubation-suites/
  70-promotion-candidates/
  80-blocked-or-held/
```

Each scope folder contains scoped child folders, not loose lists.

## Scheduled-task planning

Scheduled tasks are **not enabled from this repo yet**.

The intended future model is 12 saved-state workers under:

```text
.agent/scheduled/saved-state-01.md
...
.agent/scheduled/saved-state-12.md
```

Each worker reads its saved state, explores/catalogues one domain lane, writes lane-local findings, and stops.
