import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { readmeMissing } = await load(import.meta.url, "P30-E40.ts");
const FULL = `# Coffee Shop API
![CI](https://github.com/noa/coffee-shop-api/actions/workflows/ci.yml/badge.svg)

Live: https://coffee.example.dev

## Run locally
\`\`\`bash
cp .env.example .env
docker compose up -d
npm run start:dev
\`\`\`

## Technical decisions
- Conditional UPDATE for stock

## What I'd improve
- Outbox for emails
`;

test("README מלא ← []", () => {
  assert.deepEqual(readmeMissing(FULL), []);
  assert.deepEqual(readmeMissing(FULL.replace("## Technical decisions", "### החלטות טכניות").replace("## What I'd improve", "## מה הייתי משפר")), []);
});
test("כל אחד חסר בנפרד", () => {
  assert.deepEqual(readmeMissing(FULL.replace("# Coffee Shop API", "Coffee Shop API")), ["title"]);
  assert.deepEqual(readmeMissing(FULL.replace("https://coffee.example.dev", "coffee.example.dev").replace("https://github.com", "http://github.com")), ["live-link"]);
  assert.deepEqual(readmeMissing(FULL.replace("docker compose up -d\nnpm run start:dev", "see below")), ["run-commands"]);
  assert.deepEqual(readmeMissing(FULL.replace("## Technical decisions", "Technical decisions:")), ["decisions"]);
  assert.deepEqual(readmeMissing(FULL.replace("## What I'd improve", "## Next")), ["improve"]);
  assert.deepEqual(readmeMissing(FULL.replace("actions/workflows/ci.yml/badge.svg", "badge.svg")), ["ci-badge"]);
});
test("מקרים מטעים", () => {
  assert.deepEqual(readmeMissing("## Not a title\nnpm is great https://x.y\n"), ["title", "run-commands", "decisions", "improve", "ci-badge"], "‏## אינו כותרת ראשית; npm מחוץ לבלוק");
  assert.deepEqual(readmeMissing("# T\nWe IMPROVE things and made decisions https://x\n```\nnode server.js\n```\n## How we IMPROVE\n## Decisions\n[CI](https://x/actions/workflows/ci.yml)"), ["ci-badge"], "קישור רגיל אינו תמונה");
  assert.deepEqual(readmeMissing(""), ["title", "live-link", "run-commands", "decisions", "improve", "ci-badge"]);
});
