import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { unignoredRisks } = await load(import.meta.url, "P30-E41.ts");
const PATHS = [
  "src/main.ts",
  ".env",
  ".env.example",
  ".env.production",
  "apps/api/.env.local",
  "node_modules/express/index.js",
  "apps/api/node_modules/x/a.js",
  "dist/main.js",
  "coverage/lcov.info",
  "certs/server.pem",
  "keys/jwt.key",
  "docs/distribution.md",
  "src/dist-utils.ts",
  "README.md",
];

test("בלי .gitignore — כל המסוכנים", () => {
  assert.deepEqual(unignoredRisks("", PATHS), [".env", ".env.production", "apps/api/.env.local", "node_modules/express/index.js", "apps/api/node_modules/x/a.js", "dist/main.js", "coverage/lcov.info", "certs/server.pem", "keys/jwt.key"]);
});
test("תבניות", () => {
  const gi = "# deps\nnode_modules/\n\n/dist\n*.pem\n.env\n";
  assert.deepEqual(unignoredRisks(gi, PATHS), [".env.production", "apps/api/.env.local", "coverage/lcov.info", "keys/jwt.key"], "‏.env תופס רק .env בדיוק");
  assert.deepEqual(unignoredRisks("node_modules/\ndist/\ncoverage/\n.env*\n*.pem\n*.key\n", PATHS), []);
  assert.deepEqual(unignoredRisks("/node_modules", PATHS).filter((p) => p.includes("node_modules")), ["apps/api/node_modules/x/a.js"], "‏/ — רק בשורש");
  assert.deepEqual(unignoredRisks("coverage", ["coverage/lcov.info", "a/coverage/x"]), [], "שם בלי / — מקטע בכל עומק");
  assert.deepEqual(unignoredRisks("dist/", ["dist/a.js", "src/dist"]), ["src/dist"], "‏dist/ תופס רק תיקייה, לא קובץ בשם dist");
});
test("הערה ב־.gitignore אינה כלל", () => {
  assert.ok(unignoredRisks("# .env\n", [".env"]).includes(".env"), "שורה שמתחילה ב־# — הערה, לא מסתירה את .env");
});
