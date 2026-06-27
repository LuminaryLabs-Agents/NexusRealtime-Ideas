#!/usr/bin/env node
const url = process.env.DISCORD_WEBHOOK_URL || '';
const content = process.argv.slice(2).join(' ') || process.env.DISCORD_MESSAGE || '';

if (!url || !content) {
  console.log('discord post skipped');
  process.exit(0);
}

const res = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ content })
});

if (!res.ok) {
  console.error(`discord post failed: ${res.status}`);
  process.exit(1);
}

console.log('discord post sent');
