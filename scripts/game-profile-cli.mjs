#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildKitIdeaPackets } from '../kits/kit-idea-registry/index.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const gamesDir = path.join(root, 'games');
const sourcesDir = path.join(root, 'sources');
const publishDir = path.join(root, 'publish-games');
const publishChunkDir = path.join(publishDir, 'chunks');
const feedbackDir = path.join(root, 'feedback');
const feedbackRunsDir = path.join(feedbackDir, 'runs');
const indexFile = path.join(publishDir, 'index.json');
const kitIdeasDir = path.join(root, 'ideas', 'kit-ideas');
const kitIdeasRunsDir = path.join(kitIdeasDir, 'runs');
const kitIdeasTrackedFile = path.join(kitIdeasDir, 'tracked.jsonl');
const kitIdeasIndexFile = path.join(kitIdeasDir, 'index.json');
const domainPacketsDir = path.join(root, 'ideas', 'domain-packets');
const domainPacketsIndexFile = path.join(domainPacketsDir, 'index.json');
const chunkSize = 5000;
const splitAxes = ['category', 'subcategory', 'platform', 'genre', 'series', 'mode', 'theme', 'setting'];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJSON(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function appendLine(file, line) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, line + '\n', 'utf8');
}

function normalizeSegment(value, fallback = 'general') {
  const text = String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return text || fallback;
}

function loadIndex() {
  return readJSON(indexFile, {
    version: 1,
    createdAt: new Date().toISOString(),
    chunkSize,
    recordCount: 0,
    sourceCount: 0,
    sources: {},
    chunks: [],
  });
}

function saveIndex(index) {
  index.updatedAt = new Date().toISOString();
  index.chunkSize = chunkSize;
  writeJSON(indexFile, index);
}

function currentChunk(index) {
  if (!Array.isArray(index.chunks)) index.chunks = [];
  let chunk = index.chunks[index.chunks.length - 1];
  if (!chunk || chunk.count >= chunkSize) {
    const number = String(index.chunks.length + 1).padStart(4, '0');
    chunk = {
      path: `chunks/games-${number}.jsonl`,
      count: 0,
    };
    index.chunks.push(chunk);
  }
  return chunk;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (!item.startsWith('--')) {
      args._.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function bytesForProfile(kind) {
  if (kind === 'compact') return { min: 150, mid: 250, max: 350 };
  if (kind === 'rich') return { min: 500, mid: 900, max: 1500 };
  return { min: 150, mid: 250, max: 350 };
}

function formatBytes(n) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = n;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 100 ? 0 : size >= 10 ? 1 : 2)} ${units[unit]}`;
}

function estimate(count, profileKind) {
  const b = bytesForProfile(profileKind);
  const rawMin = count * b.min;
  const rawMid = count * b.mid;
  const rawMax = count * b.max;
  return {
    count,
    profileKind,
    perGameFiles: count,
    publishChunksAt5000: Math.ceil(count / chunkSize),
    raw: { min: rawMin, mid: rawMid, max: rawMax },
    human: {
      min: formatBytes(rawMin),
      mid: formatBytes(rawMid),
      max: formatBytes(rawMax),
    },
  };
}

function init() {
  ensureDir(sourcesDir);
  ensureDir(gamesDir);
  ensureDir(publishDir);
  ensureDir(publishChunkDir);
  ensureDir(feedbackRunsDir);
  ensureDir(kitIdeasDir);
  ensureDir(kitIdeasRunsDir);
  ensureDir(domainPacketsDir);
  if (!fs.existsSync(indexFile)) saveIndex(loadIndex());
  if (!fs.existsSync(kitIdeasIndexFile)) {
    writeJSON(kitIdeasIndexFile, {
      version: 1,
      trackedCount: 0,
      packetCount: 0,
      runs: [],
      updatedAt: new Date().toISOString(),
    });
  }
  if (!fs.existsSync(kitIdeasTrackedFile)) fs.writeFileSync(kitIdeasTrackedFile, '', 'utf8');
  if (!fs.existsSync(domainPacketsIndexFile)) {
    writeJSON(domainPacketsIndexFile, {
      version: 1,
      packetCount: 0,
      runs: [],
      updatedAt: new Date().toISOString(),
    });
  }
  console.log(`Initialized ${path.relative(root, gamesDir)} and ${path.relative(root, publishDir)}`);
}

function normalizeProfile(raw) {
  const name = String(raw.name || raw.title || raw.game || raw.id || 'untitled game').trim();
  const slug = normalizeSegment(raw.slug || name, 'game');
  const category = normalizeSegment(raw.category || raw.genre || raw.series || raw.platform || 'uncategorized', 'uncategorized');
  const subcategory = normalizeSegment(raw.subcategory || raw.subCategory || raw.mode || raw.theme || raw.setting || 'general', 'general');
  const profile = {
    id: String(raw.id || slug),
    slug,
    name,
    category,
    subcategory,
    cost: raw.cost ?? raw.price ?? null,
    timeToPlay: raw.timeToPlay ?? raw.timeToComplete ?? raw.playTime ?? null,
    description: String(raw.description || raw.gameplayDescription || raw.summary || '').trim(),
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    source: raw.source || raw.sourceList || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...raw,
  };
  profile.slug = slug;
  profile.category = category;
  profile.subcategory = subcategory;
  profile.timeline = Array.isArray(profile.timeline) ? profile.timeline : [];
  return profile;
}

function defaultTimeline(profile) {
  const tag = profile.category || profile.genre || profile.subcategory || 'game';
  return [
    { step: 1, label: 'setup', detail: `Enter the ${tag} loop and establish the starting state.` },
    { step: 2, label: 'first action', detail: 'Make the first meaningful move or decision.' },
    { step: 3, label: 'core loop', detail: 'Repeat the main play pattern and build momentum.' },
    { step: 4, label: 'escalation', detail: 'Challenge, pressure, or complexity increases.' },
    { step: 5, label: 'session end', detail: 'Resolve the run, match, or play session.' },
  ];
}

function buildDescription(profile) {
  const bits = [profile.name, profile.category, profile.subcategory].filter(Boolean);
  return `${bits.join(' - ')} profile.`;
}

function shardKeyFromFile(file) {
  const parts = path.relative(root, file).split(path.sep);
  const idx = parts.indexOf('games');
  if (idx < 0) return 'unknown';
  if (file.endsWith('.jsonl')) return parts.slice(idx + 1).join('/') || 'unknown';
  if (parts.length < idx + 5) return 'unknown';
  return parts.slice(idx + 1, idx + 4).join('/');
}

function outputKeyFromPath(file) {
  const parts = path.relative(root, file).split(path.sep);
  const idx = parts.indexOf('games');
  if (idx < 0) return { category: 'uncategorized', subcategory: 'general' };
  if (file.endsWith('.jsonl')) return { category: parts[idx + 1] || 'uncategorized', subcategory: parts[idx + 2] || 'general' };
  if (parts.length < idx + 5) return { category: 'uncategorized', subcategory: 'general' };
  return { category: parts[idx + 1] || 'uncategorized', subcategory: parts[idx + 2] || 'general' };
}

function gameProfilePath(profile) {
  const shard = normalizeSegment(profile.slug || profile.id || profile.name, 'aa').slice(0, 2) || 'aa';
  return path.join(gamesDir, profile.category, profile.subcategory, shard, profile.slug, 'game.json');
}

function writeGameProfile(profile) {
  const file = gameProfilePath(profile);
  writeJSON(file, profile);
  return file;
}

function appendPublishProfile(profile) {
  const index = loadIndex();
  const chunk = currentChunk(index);
  const chunkFile = path.join(publishDir, chunk.path);
  appendLine(chunkFile, JSON.stringify(profile));
  chunk.count += 1;
  index.recordCount = (index.recordCount || 0) + 1;
  saveIndex(index);
  return chunk.path;
}

function add(inputPath) {
  if (!inputPath) throw new Error('Missing --input path');
  const raw = fs.readFileSync(inputPath, 'utf8').trim();
  if (!raw) return console.log('No input rows found');
  const rows = inputPath.endsWith('.jsonl')
    ? raw.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
    : JSON.parse(raw);
  const list = Array.isArray(rows) ? rows : [rows];
  ensureDir(gamesDir);
  ensureDir(publishChunkDir);
  const written = [];
  for (const row of list) {
    const profile = normalizeProfile(row);
    const gamePath = writeGameProfile(profile);
    const chunkPath = appendPublishProfile(profile);
    written.push({ gamePath: path.relative(root, gamePath), chunkPath });
  }
  console.log(`Added ${list.length} record(s) to ${path.relative(root, gamesDir)} and ${path.relative(root, publishDir)}`);
}

function validateProfile(profile, file = '') {
  const issues = [];
  const requireText = (key) => !String(profile?.[key] || '').trim();
  if (requireText('name')) issues.push({ field: 'name', issue: 'missing', fix: 'copy slug or source title into name' });
  if (requireText('description')) issues.push({ field: 'description', issue: 'missing', fix: 'generate a short descriptive summary' });
  if (!Array.isArray(profile?.timeline) || profile.timeline.length === 0) issues.push({ field: 'timeline', issue: 'missing', fix: 'insert a default 5-step timeline' });
  if (requireText('category')) issues.push({ field: 'category', issue: 'missing', fix: 'infer from folder or genres' });
  if (requireText('subcategory')) issues.push({ field: 'subcategory', issue: 'missing', fix: 'infer from folder or platform' });
  if (requireText('slug')) issues.push({ field: 'slug', issue: 'missing', fix: 'derive slug from name' });
  if (profile?.timeline && Array.isArray(profile.timeline)) {
    profile.timeline.forEach((step, i) => {
      if (!step || typeof step !== 'object') {
        issues.push({ field: `timeline[${i}]`, issue: 'invalid', fix: 'replace with structured timeline step' });
        return;
      }
      if (!Number.isFinite(Number(step.step))) issues.push({ field: `timeline[${i}].step`, issue: 'missing', fix: 'use a numeric step index' });
      if (!String(step.label || '').trim()) issues.push({ field: `timeline[${i}].label`, issue: 'missing', fix: 'add a step label' });
    });
  }
  return { file, ok: issues.length === 0, issues };
}

function collectGameProfiles(dir = gamesDir) {
  const { absolute, files } = collectGameFiles(dir);
  return { absolute, files, profiles: files.flatMap((file) => profilesFromArtifact(file)) };
}

function writeFeedbackRun(summary, issues) {
  const runId = `audit-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const runDir = path.join(feedbackRunsDir, runId);
  ensureDir(runDir);
  writeJSON(path.join(runDir, 'summary.json'), summary);
  fs.writeFileSync(path.join(runDir, 'issues.jsonl'), issues.map((issue) => JSON.stringify(issue)).join('\n') + (issues.length ? '\n' : ''), 'utf8');
  const md = [
    `# Audit ${runId}`,
    '',
    `- total files: ${summary.totalFiles}`,
    `- valid files: ${summary.validFiles}`,
    `- issues: ${summary.issueCount}`,
    '',
    '## Issues',
    ...issues.map((issue) => `- ${issue.file}: ${issue.field} ${issue.issue} -> ${issue.fix}`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(runDir, 'summary.md'), md, 'utf8');
  return { runId, runDir };
}

function readJsonlLines(file) {
  const text = fs.readFileSync(file, 'utf8');
  return text.split(/\r?\n/).filter(Boolean);
}

function writeJsonlLines(file, lines) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
}

function loadKitIdeasIndex() {
  return readJSON(kitIdeasIndexFile, {
    version: 1,
    trackedCount: 0,
    packetCount: 0,
    runs: [],
  });
}

function saveKitIdeasIndex(index) {
  index.updatedAt = new Date().toISOString();
  writeJSON(kitIdeasIndexFile, index);
}

function loadDomainPacketsIndex() {
  return readJSON(domainPacketsIndexFile, {
    version: 1,
    packetCount: 0,
    runs: [],
  });
}

function saveDomainPacketsIndex(index) {
  index.updatedAt = new Date().toISOString();
  writeJSON(domainPacketsIndexFile, index);
}

function appendKitIdeasTracked(entry) {
  appendLine(kitIdeasTrackedFile, JSON.stringify(entry));
}

function publishChunkPathFromGameFile(file) {
  return path.join(publishChunkDir, path.basename(file));
}

function kitIdeasRunId() {
  return `kit-ideas-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

function collectNextUntrackedGameProfiles(limit = 1) {
  const { files } = collectGameFiles(gamesDir);
  const entries = [];
  for (const file of files) {
    const publishFile = publishChunkPathFromGameFile(file);
    for (const { profile, line } of profilesFromArtifact(file)) {
      if (profile.kitIdeasTracked) continue;
      entries.push({ file, publishFile, line, profile });
      if (entries.length >= limit) return entries;
    }
  }
  return entries;
}

function markKitIdeasTracked(entry, runId, packetCount) {
  const trackedAt = new Date().toISOString();
  const patch = {
    kitIdeasTracked: true,
    kitIdeasTrackedAt: trackedAt,
    kitIdeasRunId: runId,
    kitIdeasPacketCount: packetCount,
  };
  const sourceChanged = rewriteJsonlProfile(entry.file, entry.line, (profile) => ({ ...profile, ...patch, updatedAt: trackedAt }));
  const publishChanged = fs.existsSync(entry.publishFile)
    ? rewriteJsonlProfile(entry.publishFile, entry.line, (profile) => ({ ...profile, ...patch, updatedAt: trackedAt }))
    : false;
  return sourceChanged || publishChanged;
}

function writeKitIdeaGameRun(runDir, entry, packets) {
  const gameDir = path.join(runDir, entry.profile.slug || normalizeSegment(entry.profile.name || 'game'));
  ensureDir(gameDir);
  writeJSON(path.join(gameDir, 'profile.json'), entry.profile);
  writeJSON(path.join(gameDir, 'summary.json'), {
    gameId: entry.profile.id,
    gameName: entry.profile.name,
    gameSlug: entry.profile.slug,
    sourceFile: path.relative(root, entry.file),
    sourceLine: entry.line,
    packetCount: packets.length,
  });
  writeJsonlLines(path.join(gameDir, 'packets.jsonl'), packets.map((packet) => JSON.stringify(packet)));
  const md = [
    `# ${entry.profile.name} Kit Ideas`,
    '',
    `- tracked: true`,
    `- packet count: ${packets.length}`,
    `- source file: ${path.relative(root, entry.file)}`,
    `- source line: ${entry.line}`,
    '',
    '## Packet Sample',
    '',
    `- ${packets[0]?.kitName || 'no packets generated'}`,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(gameDir, 'status.md'), md, 'utf8');
  return gameDir;
}

function writeDomainPacketRun(runId, entry, packets) {
  const groups = new Map();
  for (const packet of packets) {
    const domain = normalizeSegment(packet.domain || 'uncategorized', 'uncategorized');
    const subdomain = normalizeSegment(packet.subdomain || packet.kind || 'general', 'general');
    const key = `${domain}/${subdomain}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(packet);
  }
  const written = [];
  for (const [key, groupedPackets] of groups.entries()) {
    const [domain, subdomain] = key.split('/');
    const packetDir = path.join(domainPacketsDir, domain, subdomain, entry.profile.slug || normalizeSegment(entry.profile.name || 'game'), runId);
    ensureDir(packetDir);
    writeJsonlLines(path.join(packetDir, 'packets.jsonl'), groupedPackets.map((packet) => JSON.stringify(packet)));
    writeJSON(path.join(packetDir, 'summary.json'), {
      runId,
      gameId: entry.profile.id,
      gameSlug: entry.profile.slug,
      gameName: entry.profile.name,
      domain,
      subdomain,
      packetCount: groupedPackets.length,
    });
    written.push({
      domain,
      subdomain,
      packetCount: groupedPackets.length,
      path: path.relative(root, packetDir),
    });
  }
  const index = loadDomainPacketsIndex();
  index.packetCount = (index.packetCount || 0) + packets.length;
  index.runs = Array.isArray(index.runs) ? index.runs : [];
  index.runs.push({
    runId,
    gameId: entry.profile.id,
    gameSlug: entry.profile.slug,
    gameName: entry.profile.name,
    packetCount: packets.length,
    groups: written,
    createdAt: new Date().toISOString(),
  });
  saveDomainPacketsIndex(index);
  return written;
}

function kitIdeasNext(limit = 1) {
  const entries = collectNextUntrackedGameProfiles(limit);
  const next = entries.map((entry) => ({
    gameId: entry.profile.id,
    gameSlug: entry.profile.slug,
    gameName: entry.profile.name,
    sourceFile: path.relative(root, entry.file),
    sourceLine: entry.line,
    category: entry.profile.category,
    subcategory: entry.profile.subcategory,
  }));
  console.log(JSON.stringify({ count: next.length, next }, null, 2));
}

function kitIdeasGenerate(args) {
  const count = Math.max(1, Number(args.count || 1));
  const packetCount = Math.max(100, Number(args.packets || 120));
  const entries = collectNextUntrackedGameProfiles(count);
  const runId = kitIdeasRunId();
  const runDir = path.join(kitIdeasRunsDir, runId);
  ensureDir(runDir);
  const runGames = [];
  let trackedCount = 0;
  let packetTotal = 0;
  for (const entry of entries) {
    const packets = buildKitIdeaPackets(entry.profile, { count: packetCount });
    writeKitIdeaGameRun(runDir, entry, packets);
    writeDomainPacketRun(runId, entry, packets);
    const tracked = markKitIdeasTracked(entry, runId, packets.length);
    if (tracked) {
      appendKitIdeasTracked({
        runId,
        trackedAt: new Date().toISOString(),
        gameId: entry.profile.id,
        gameSlug: entry.profile.slug,
        gameName: entry.profile.name,
        sourceFile: path.relative(root, entry.file),
        sourceLine: entry.line,
        packetCount: packets.length,
      });
      trackedCount += 1;
    }
    packetTotal += packets.length;
    runGames.push({
      gameId: entry.profile.id,
      gameSlug: entry.profile.slug,
      gameName: entry.profile.name,
      packetCount: packets.length,
    });
  }
  const index = loadKitIdeasIndex();
  index.trackedCount = (index.trackedCount || 0) + trackedCount;
  index.packetCount = (index.packetCount || 0) + packetTotal;
  index.runs = Array.isArray(index.runs) ? index.runs : [];
  index.runs.push({
    runId,
    trackedCount,
    packetTotal,
    createdAt: new Date().toISOString(),
    games: runGames,
  });
  saveKitIdeasIndex(index);
  writeJSON(path.join(runDir, 'summary.json'), {
    runId,
    trackedCount,
    packetTotal,
    games: runGames,
  });
  fs.writeFileSync(path.join(runDir, 'summary.md'), [
    `# Kit Ideas ${runId}`,
    '',
    `- tracked games: ${trackedCount}`,
    `- packet total: ${packetTotal}`,
    `- packet target per game: ${packetCount}`,
    '',
  ].join('\n'), 'utf8');
  console.log(JSON.stringify({ runId, trackedCount, packetTotal, packetTarget: packetCount, games: runGames }, null, 2));
}

function auditGames() {
  const { absolute, files } = collectGameFiles(gamesDir);
  const issues = [];
  let validFiles = 0;
  const shards = new Map();
  let totalFiles = 0;
  for (const file of files) {
    const entries = profilesFromArtifact(file);
    const shard = shardKeyFromFile(file);
    for (const { profile, line } of entries) {
      totalFiles += 1;
      const result = validateProfile(profile, file);
      if (result.ok) validFiles += 1;
      else issues.push(...result.issues.map((issue) => ({ ...issue, file, line, shard })));
      shards.set(shard, (shards.get(shard) || 0) + 1);
    }
  }
  for (const [shard, count] of shards.entries()) {
    if (count > chunkSize) {
      issues.push({
        file: shard,
        shard,
        field: 'shard',
        issue: `over-${chunkSize}`,
        fix: 'split this shard by the most diverse subcategory axis',
        count,
      });
    }
  }
  const summary = {
    dir: path.relative(root, absolute),
    totalFiles,
    validFiles,
    issueCount: issues.length,
    shardCount: shards.size,
    chunkSize,
  };
  const run = writeFeedbackRun(summary, issues);
  console.log(JSON.stringify({ ...summary, feedbackRun: path.relative(root, run.runDir) }, null, 2));
}

function rewriteProfileFile(file, updater) {
  const profile = profileFromFile(file);
  if (!profile) return false;
  const next = updater(profile);
  if (!next) return false;
  writeJSON(file, next);
  return true;
}

function rewriteJsonlProfile(file, lineNumber, updater) {
  if (!Number.isInteger(lineNumber) || lineNumber < 1) return false;
  const lines = readJsonlLines(file);
  const index = lineNumber - 1;
  if (!lines[index]) return false;
  const profile = JSON.parse(lines[index]);
  const next = updater(profile);
  if (!next) return false;
  lines[index] = JSON.stringify(next);
  writeJsonlLines(file, lines);
  return true;
}

function fixProfileFromIssue(file, issue) {
  if (file.endsWith('.jsonl')) {
    return rewriteJsonlProfile(file, Number(issue.line || issue.row || 0), (profile) => {
      let changed = false;
      if (issue.field === 'name' && !String(profile.name || '').trim()) {
        profile.name = profile.slug || path.basename(path.dirname(file));
        changed = true;
      }
      if (issue.field === 'slug' && !String(profile.slug || '').trim()) {
        profile.slug = normalizeSegment(profile.name || path.basename(path.dirname(file)));
        changed = true;
      }
      if (issue.field === 'description' && !String(profile.description || '').trim()) {
        profile.description = buildDescription(profile);
        changed = true;
      }
      if (issue.field === 'timeline' && (!Array.isArray(profile.timeline) || profile.timeline.length === 0)) {
        profile.timeline = defaultTimeline(profile);
        changed = true;
      }
      if (issue.field === 'category' && !String(profile.category || '').trim()) {
        profile.category = outputKeyFromPath(file).category;
        changed = true;
      }
      if (issue.field === 'subcategory' && !String(profile.subcategory || '').trim()) {
        profile.subcategory = outputKeyFromPath(file).subcategory;
        changed = true;
      }
      if (issue.field && issue.field.startsWith('timeline[') && Array.isArray(profile.timeline)) {
        profile.timeline = defaultTimeline(profile);
        changed = true;
      }
      if (!changed) return null;
      profile.updatedAt = new Date().toISOString();
      return profile;
    });
  }
  return rewriteProfileFile(file, (profile) => {
    let changed = false;
    if (issue.field === 'name' && !String(profile.name || '').trim()) {
      profile.name = profile.slug || path.basename(path.dirname(file));
      changed = true;
    }
    if (issue.field === 'slug' && !String(profile.slug || '').trim()) {
      profile.slug = normalizeSegment(profile.name || path.basename(path.dirname(file)));
      changed = true;
    }
    if (issue.field === 'description' && !String(profile.description || '').trim()) {
      profile.description = buildDescription(profile);
      changed = true;
    }
    if (issue.field === 'timeline' && (!Array.isArray(profile.timeline) || profile.timeline.length === 0)) {
      profile.timeline = defaultTimeline(profile);
      changed = true;
    }
    if (issue.field === 'category' && !String(profile.category || '').trim()) {
      profile.category = outputKeyFromPath(file).category;
      changed = true;
    }
    if (issue.field === 'subcategory' && !String(profile.subcategory || '').trim()) {
      profile.subcategory = outputKeyFromPath(file).subcategory;
      changed = true;
    }
    if (issue.field && issue.field.startsWith('timeline[') && Array.isArray(profile.timeline)) {
      profile.timeline = defaultTimeline(profile);
      changed = true;
    }
    if (!changed) return null;
    profile.updatedAt = new Date().toISOString();
    return profile;
  });
}

function loadFeedbackIssues(dir = feedbackRunsDir) {
  const issues = [];
  if (!fs.existsSync(dir)) return issues;
  const directFile = path.join(dir, 'issues.jsonl');
  if (fs.existsSync(directFile)) {
    const lines = fs.readFileSync(directFile, 'utf8').trim().split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try { issues.push(JSON.parse(line)); } catch {}
    }
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(dir, entry.name, 'issues.jsonl');
    if (!fs.existsSync(file)) continue;
    const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try { issues.push(JSON.parse(line)); } catch {}
    }
  }
  return issues;
}

function fixFeedback(targetRunId = '') {
  const dir = targetRunId ? path.join(feedbackRunsDir, targetRunId) : feedbackRunsDir;
  const issues = loadFeedbackIssues(dir);
  let fixed = 0;
  for (const issue of issues) {
    if (!issue.file || !fs.existsSync(issue.file)) continue;
    if (fixProfileFromIssue(issue.file, issue)) fixed += 1;
  }
  const report = {
    target: path.relative(root, dir),
    issues: issues.length,
    fixed,
  };
  console.log(JSON.stringify(report, null, 2));
}

function profileFromFile(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function profilesFromJsonl(file) {
  try {
    const text = fs.readFileSync(file, 'utf8').trim();
    if (!text) return [];
    return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function profilesFromArtifact(file) {
  if (file.endsWith('.jsonl')) return profilesFromJsonl(file).map((profile, index) => ({ file, profile, line: index + 1 }));
  const profile = profileFromFile(file);
  return profile ? [{ file, profile, line: 1 }] : [];
}

function axisValue(profile, axis) {
  const value = profile?.[axis];
  if (Array.isArray(value)) return normalizeSegment(value[0]);
  return normalizeSegment(value);
}

function scoreAxis(entries, axis) {
  const buckets = new Map();
  for (const { profile } of entries) {
    const value = axisValue(profile, axis);
    if (!value) continue;
    buckets.set(value, (buckets.get(value) || 0) + 1);
  }
  const sizes = [...buckets.values()];
  if (!sizes.length) return null;
  const total = sizes.reduce((sum, n) => sum + n, 0);
  const entropy = sizes.reduce((sum, n) => {
    const p = n / total;
    return sum - p * Math.log2(p);
  }, 0);
  const overLimit = sizes.filter((n) => n > chunkSize).length;
  const largest = Math.max(...sizes);
  return {
    axis,
    buckets,
    entropy,
    bucketCount: buckets.size,
    largest,
    overLimit,
    score: entropy * 1000 + buckets.size * 10 - largest - overLimit * 100,
  };
}

function bestAxis(entries, axes = splitAxes) {
  const scored = axes.map((axis) => scoreAxis(entries, axis)).filter(Boolean).sort((a, b) => b.score - a.score);
  return scored[0] || null;
}

function buildSplitTree(entries, axes = splitAxes) {
  const total = entries.length;
  const node = { total, needsSplit: total > chunkSize, chunkSize };
  if (total <= chunkSize || !axes.length) return node;
  const best = bestAxis(entries, axes);
  if (!best) return node;
  node.axis = best.axis;
  node.buckets = [...best.buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([value, count]) => {
    const remainingAxes = axes.filter((axis) => axis !== best.axis);
    const child = { value, count };
    const bucketEntries = entries.filter(({ profile }) => axisValue(profile, best.axis) === value);
    if (count > chunkSize && remainingAxes.length) child.children = buildSplitTree(bucketEntries, remainingAxes);
    return child;
  });
  return node;
}

function collectGameFiles(dir) {
  const absolute = path.isAbsolute(dir) ? dir : path.join(root, dir);
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && (entry.name === 'game.json' || entry.name.endsWith('.jsonl'))) files.push(full);
    }
  }
  walk(absolute);
  return { absolute, files };
}

function planSplit(targetDir) {
  if (!targetDir) throw new Error('Missing --dir path');
  const { absolute, profiles } = collectGameProfiles(targetDir);
  const tree = buildSplitTree(profiles);
  console.log(JSON.stringify({
    dir: path.relative(root, absolute),
    total: profiles.length,
    tree,
  }, null, 2));
}

function validatePath(targetPath) {
  if (!targetPath) throw new Error('Missing --path path');
  const absolute = path.isAbsolute(targetPath) ? targetPath : path.join(root, targetPath);
  const stat = fs.statSync(absolute);
  if (stat.isDirectory()) {
    const { files } = collectGameFiles(absolute);
    const results = [];
    for (const file of files) {
      for (const { profile, line } of profilesFromArtifact(file)) {
        results.push(validateProfile(profile, `${file}#${line}`));
      }
    }
    console.log(JSON.stringify({
      dir: path.relative(root, absolute),
      totalFiles: results.length,
      validFiles: results.filter((r) => r.ok).length,
      issueCount: results.reduce((sum, r) => sum + r.issues.length, 0),
      results,
    }, null, 2));
    return;
  }
  if (absolute.endsWith('.jsonl')) {
    const results = profilesFromJsonl(absolute).map((profile, index) => validateProfile(profile, `${absolute}#${index + 1}`));
    console.log(JSON.stringify({
      file: path.relative(root, absolute),
      totalFiles: results.length,
      validFiles: results.filter((r) => r.ok).length,
      issueCount: results.reduce((sum, r) => sum + r.issues.length, 0),
      results,
    }, null, 2));
    return;
  }
  const profile = profileFromFile(absolute);
  const result = validateProfile(profile, absolute);
  console.log(JSON.stringify(result, null, 2));
}

async function importRawg(args) {
  const apiKey = process.env.RAWG_API_KEY || process.env.RAWG_KEY;
  if (!apiKey) throw new Error('Missing RAWG_API_KEY');
  const pageSize = Math.min(40, Number(args.pageSize || 40));
  const limit = Number(args.limit || 200000);
  const maxPages = Number(args.pages || Math.ceil(limit / pageSize));
  const ordering = String(args.ordering || '-added');
  let imported = 0;
  let page = Number(args.page || 1);
  init();
  while (imported < limit && page <= maxPages) {
    const url = new URL('https://api.rawg.io/api/games');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('page_size', String(pageSize));
    url.searchParams.set('page', String(page));
    url.searchParams.set('ordering', ordering);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`RAWG request failed: ${response.status} ${response.statusText}`);
    const payload = await response.json();
    const results = Array.isArray(payload.results) ? payload.results : [];
    if (!results.length) break;
    for (const item of results) {
      if (imported >= limit) break;
      const profile = normalizeProfile({
        id: `rawg-${item.id}`,
        slug: item.slug,
        name: item.name,
        category: item.genres?.[0]?.slug || 'uncategorized',
        subcategory: item.platforms?.[0]?.platform?.slug || 'general',
        cost: null,
        timeToPlay: item.playtime ?? null,
        description: `${item.name} is a catalog entry from RAWG.`,
        timeline: [
          { step: 1, label: 'start', detail: 'Open the game and establish the core loop.' },
          { step: 2, label: 'core loop', detail: 'Play through the main mechanics and objectives.' },
          { step: 3, label: 'escalation', detail: 'Difficulty or complexity increases.' },
          { step: 4, label: 'resolution', detail: 'Complete a run, match, or session goal.' },
        ],
        source: 'rawg',
        sourceId: item.id,
        sourceUrl: `https://rawg.io/games/${item.slug}`,
        released: item.released || null,
        rating: item.rating ?? null,
        metacritic: item.metacritic ?? null,
        genres: item.genres?.map((g) => g.slug) || [],
        platforms: item.platforms?.map((p) => p.platform?.slug).filter(Boolean) || [],
      });
      writeGameProfile(profile);
      appendPublishProfile(profile);
      imported += 1;
    }
    page += 1;
  }
  const index = loadIndex();
  index.sources.rawg = { imported, pageSize, lastPage: page - 1, ordering };
  index.sourceCount = (index.sourceCount || 0) + imported;
  saveIndex(index);
  console.log(JSON.stringify({ imported, pageSize, lastPage: page - 1, ordering }, null, 2));
}

function importRawgHf(args) {
  const script = path.join(root, 'scripts', 'import-rawg-hf.py');
  const python = process.env.PYTHON || 'python3';
  const argv = [script, '--root', root];
  if (args.limit !== undefined && args.limit !== null && String(args.limit).trim() !== '') {
    argv.push('--limit', String(args.limit));
  }
  const result = spawnSync(python, argv, {
    stdio: 'inherit',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });
  if (result.status !== 0) {
    throw new Error(`HF import failed with status ${result.status ?? 1}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'help';
  if (command === 'init') return init();
  if (command === 'estimate') {
    const count = Number(args.count || 200000);
    const kind = String(args.profile || 'compact');
    const result = estimate(count, kind);
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (command === 'add') return add(args.input);
  if (command === 'audit') return auditGames();
  if (command === 'plan-split') return planSplit(args.dir);
  if (command === 'validate') return validatePath(args.path);
  if (command === 'fix-feedback') return fixFeedback(args.run);
  if (command === 'kit-ideas-next') return kitIdeasNext(Number(args.count || 1));
  if (command === 'kit-ideas-generate') return kitIdeasGenerate(args);
  if (command === 'import-rawg') return importRawg(args);
  if (command === 'import-rawg-hf') return importRawgHf(args);
  console.log([
    'Usage:',
    '  node scripts/game-profile-cli.mjs init',
    '  node scripts/game-profile-cli.mjs estimate --count 200000 --profile compact',
    '  node scripts/game-profile-cli.mjs add --input ./games.jsonl',
    '  node scripts/game-profile-cli.mjs audit',
    '  node scripts/game-profile-cli.mjs plan-split --dir ./games',
    '  node scripts/game-profile-cli.mjs validate --path ./games',
    '  node scripts/game-profile-cli.mjs fix-feedback --run audit-...',
    '  node scripts/game-profile-cli.mjs kit-ideas-next --count 5',
    '  node scripts/game-profile-cli.mjs kit-ideas-generate --count 1 --packets 120',
    '  RAWG_API_KEY=... node scripts/game-profile-cli.mjs import-rawg --limit 200000',
    '  node scripts/game-profile-cli.mjs import-rawg-hf --limit 881069',
  ].join('\n'));
}

main();
