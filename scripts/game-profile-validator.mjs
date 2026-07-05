#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const cli = path.join(root, 'scripts', 'game-profile-cli.mjs');
const args = process.argv.slice(2);
const result = spawnSync(process.execPath, [cli, 'validate', ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);
