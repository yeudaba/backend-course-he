import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E64.ts", ["isIgnored"])).isIgnored;
const PROJECT = ["# מהשיעור", "node_modules", "dist/", "coverage", "src/generated", ".git", ".env", ".env.*", "!.env.example", "*.log", ""];

test(".dockerignore של הפרויקט", async () => {
  const isIgnored = await get();
  const cases = {
    "node_modules/express/index.js": true, "dist/main.js": true, "coverage/index.html": true, "src/generated/prisma/client.ts": true,
    ".git/HEAD": true, ".env": true, ".env.production": true, ".env.example": false, "debug.log": true, "logs/app.log": false,
    "src/app.ts": false, "package.json": false, "src/node_modules.ts": false, "my.env": false, "prisma/schema.prisma": false,
  };
  for (const [file, want] of Object.entries(cases)) assert.equal(isIgnored(file, PROJECT), want, file);
});
test("wildcards", async () => {
  const isIgnored = await get();
  assert.equal(isIgnored("logs/app.log", ["**/*.log"]), true);
  assert.equal(isIgnored("a.log", ["**/*.log"]), true, "** גם אפס תיקיות");
  assert.equal(isIgnored("x/y/z.log", ["**/*.log"]), true);
  assert.equal(isIgnored("a.log", ["*/*.log"]), false);
  assert.equal(isIgnored("tmp1/x", ["tmp?"]), true);
  assert.equal(isIgnored("tmp12/x", ["tmp?"]), false);
  assert.equal(isIgnored("a+b.txt", ["a+b.txt"]), true, "תווים של regex — כטקסט");
  assert.equal(isIgnored("aab.txt", ["a+b.txt"]), false);
  assert.equal(isIgnored("docs/readme.md", ["/docs/"]), true, "/ בהתחלה ובסוף");
});
test("האחרונה שמתאימה קובעת", async () => {
  const isIgnored = await get();
  assert.equal(isIgnored(".env.example", ["!.env.example", ".env.*"]), true, "בסדר הפוך ה־! לא עוזר");
  assert.equal(isIgnored("docs/keep.md", ["docs", "!docs/keep.md"]), false);
  assert.equal(isIgnored("docs/other.md", ["docs", "!docs/keep.md"]), true);
  assert.equal(isIgnored("x", []), false);
});
