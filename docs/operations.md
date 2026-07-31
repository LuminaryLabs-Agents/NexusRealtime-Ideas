# Operations

## Prerequisites

- Node.js 20 or newer
- Python only for the Hugging Face import path
- Credentials only for the external operation that requires them

No dependency installation is required for the root Node CLI.

## Read-only or report-only commands

```bash
npm run games:estimate
npm run games:split
npm run ideas:kit-next
node scripts/game-profile-cli.mjs validate --path games/rawg/chunks/rawg-0001.jsonl
```

`games:validate` scans the full `games/` corpus and prints per-record results. Redirect its output outside the repository when running it intentionally.

## Mutating commands

| Command | Tracked effects |
| --- | --- |
| `npm run games:init` | Creates missing indexes and storage files. |
| `node scripts/game-profile-cli.mjs add --input <file>` | Writes source profiles and appends publish records. |
| `npm run games:audit` | Writes a new feedback run. |
| `npm run games:fix` | Rewrites repairable profile records from feedback. |
| `npm run games:import-rawg` | Imports from the RAWG API using `RAWG_API_KEY`. |
| `npm run games:import-rawg-hf` | Imports the configured Hugging Face dataset. |
| `npm run ideas:kit-generate` | Writes packet runs and marks source and publish records as tracked. |
| `npm run cascadeseeder:folderwalker` | Writes generated ideas, scope folders, and run records. |

Before a mutating command:

1. Confirm the intended branch and clean working tree.
2. Back up or isolate the affected data scope.
3. Start with one record, one shard, or one idea.
4. Inspect generated files and `git diff` before scaling.
5. Commit evidence and data changes separately when practical.

## Validation sequence

```text
inspect one record
  -> validate one shard
  -> inspect output size and findings
  -> run the intended bounded mutation
  -> validate the affected shard again
  -> review diff and run artifacts
```

The 2026-07-02 audit is historical evidence only. It does not replace validation after a change.

## CascadeSeeder automation

The workflow in `.github/workflows/test.yml` runs on `build` or manual dispatch. It can:

1. start a temporary monitor and optionally notify Discord;
2. prepare the folder-aware prompt;
3. call NVIDIA NIM;
4. fall back to llama.cpp when configured;
5. apply parsed output or the built-in fallback seed;
6. upload evidence and commit generated catalogue paths to `build`.

Required secrets for the intended hosted path are `DISCORD_WEBHOOK_URL` and `NVIDIA_API_KEY`. `HF_MODEL_URL` and `HF_TOKEN` support the optional fallback. Never place values in tracked docs or logs.

GitHub records the latest listed CascadeSeeder run as successful on `build` on 2026-06-27. A green workflow proves that run completed; it does not prove every generated idea is semantically valid.
