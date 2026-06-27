#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const port = Number(process.env.LIVE_MONITOR_PORT || 8080);
const liveDir = path.join(root, '.agent', 'runtime', 'live');
const publicDir = path.join(root, 'harnesses', 'cascadeseeder-lite', 'live', 'public');
const exitPath = path.join(liveDir, 'exit-requested');

function readFile(file, fallback) {
  try { return fs.readFileSync(file); } catch { return Buffer.from(fallback); }
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

const app = http.createServer((req, res) => {
  const route = (req.url || '/').split('?')[0];
  if (req.method === 'POST' && route === '/exit') {
    ensureDir(liveDir);
    fs.writeFileSync(exitPath, new Date().toISOString() + '\n', 'utf8');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end('<h1>Exit requested</h1><p>The workflow will close the live monitor shortly.</p><p><a href="/">Back</a></p>');
    return;
  }
  let type = 'text/plain; charset=utf-8';
  let body = Buffer.from('not found\n');
  let status = 404;
  if (route === '/' || route === '/index.html') {
    status = 200; type = 'text/html; charset=utf-8'; body = readFile(path.join(publicDir, 'index.html'), '<h1>CascadeSeeder Live</h1>');
  } else if (route === '/state.json') {
    status = 200; type = 'application/json; charset=utf-8'; body = readFile(path.join(liveDir, 'state.json'), '{"status":"starting"}\n');
  } else if (route === '/events.jsonl') {
    status = 200; type = 'text/plain; charset=utf-8'; body = readFile(path.join(liveDir, 'events.jsonl'), '');
  } else if (route === '/full-run-log.md') {
    const runId = readFile(path.join(root, '.agent', 'runtime', 'cascadeseeder-run-id'), '').toString().trim();
    status = 200; type = 'text/markdown; charset=utf-8'; body = runId ? readFile(path.join(root, 'ideas', 'generated-runs', runId, 'full-run-log.md'), '# Full run log pending\n') : Buffer.from('# Run not prepared yet\n');
  } else if (route === '/exit-status') {
    status = 200; type = 'text/plain; charset=utf-8'; body = Buffer.from(fs.existsSync(exitPath) ? 'exit requested\n' : 'waiting\n');
  }
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
});

app.listen(port, '127.0.0.1', () => console.log(`live monitor on ${port}`));
