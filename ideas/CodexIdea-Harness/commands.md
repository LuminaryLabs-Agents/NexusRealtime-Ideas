# CodexIdea-Harness Commands

```text
node scripts/game-profile-cli.mjs kit-ideas-next --count 1
node scripts/game-profile-cli.mjs kit-ideas-generate --count 1 --packets 120
node scripts/game-profile-cli.mjs audit
node scripts/game-profile-cli.mjs validate --path ./games
node scripts/game-profile-cli.mjs fix-feedback --run <run-id>
cd /Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Automations && npm run game:batch -- --limit 50
cd /Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Automations && npm run game:batch:next
cd /Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Automations && npm run goal:loop -- --file .agent/CURRENT_SINGLE_GAME_EXTRACTION_PROMPT.md --title "<game title> kit extraction" --max-kits 5
cd /Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Automations && npm run game:batch:consume -- --run <run-id>
```

## Loop Shape

1. scan the next record
2. extract reusable domains
3. generate packets
4. consume the record
5. mirror packets into domain folders
6. audit and validate
7. repair feedback
