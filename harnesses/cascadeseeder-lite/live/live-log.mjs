#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const liveDir = path.join(root, '.agent', 'runtime', 'live');
const statePath = path.join(liveDir, 'state.json');
const eventsPath = path.join(liveDir, 'events.jsonl');

function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }
function readJson(p, fallback) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; } }
function writeJson(p, value) { mkdir(path.dirname(p)); fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n', 'utf8'); }
function append(p, text) { mkdir(path.dirname(p)); fs.appendFileSync(p, text, 'utf8'); }
function scrub(value) { return String(value || '').replace(/(token|webhook|authorization|bearer)=[^\s]+/ig, '$1=[redacted]'); }

const [command = 'event', stage = 'unknown', status = 'info', ...rest] = process.argv.slice(2);
const message = scrub(rest.join(' '));
const now = new Date().toISOString();

const state = readJson(statePath, {
  startedAt: now,
  updatedAt: now,
  currentStage: 'init',
  stages: {},
  eventCount: 0
});

if (command === 'reset') {
  mkdir(liveDir);
  writeJson(statePath, { startedAt: now, updatedAt: now, currentStage: 'init', stages: {}, eventCount: 0 });
  fs.writeFileSync(eventsPath, '', 'utf8');
  process.exit(0);
}

const event = { ts: now, stage, status, message };
state.updatedAt = now;
state.currentStage = stage;
state.stages[stage] = { status, message, updatedAt: now };
state.eventCount = Number(state.eventCount || 0) + 1;
writeJson(statePath, state);
append(eventsPath, JSON.stringify(event) + '\n');
console.log(`[live] ${stage} ${status} ${message}`);
