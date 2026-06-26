#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const runId = `${stamp}-cascadeseeder-lite`;
const runDir = path.join(root, 'ideas', 'generated-runs', runId);
fs.mkdirSync(runDir, { recursive: true });

const log = [`Run ${runId}`];
fs.writeFileSync(path.join(runDir, 'full-run-log.md'), `# CascadeSeeder Lite Full Run Log\n\n- Run ID: ${runId}\n- Status: harness placeholder executed\n`, 'utf8');
console.log(log.join('\n'));
