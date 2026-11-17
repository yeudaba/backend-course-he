import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E92.ts", ["readmeProblems"])).readmeProblems;
const opts = { user: "dana", repo: "tasks-api", liveUrl: "https://tasks-api-x1.onrender.com/" };
const GOOD = `# tasks-api

![CI](https://github.com/dana/tasks-api/actions/workflows/ci.yml/badge.svg)

API למשימות. **חי:** [Swagger](https://tasks-api-x1.onrender.com/docs) · [הדף](https://tasks-web.onrender.com)

NestJS · PostgreSQL (Neon) · Docker (Render) · CI/CD ב־GitHub Actions
`;

test("תקין", async () => {
  const f = await get();
  assert.deepEqual(f(GOOD, opts), []);
});
test("כל הבעיות, בסדר", async () => {
  const f = await get();
  assert.deepEqual(f("# x\n![CI](https://github.com/YOUR-USER/tasks-api/actions/workflows/ci.yml/badge.svg)\nNestJS · PostgreSQL\nDocker", opts), ["badge", "live-link", "architecture", "placeholder"]);
});
test("תג רחוק מדי, ופרטים", async () => {
  const f = await get();
  const far = GOOD.replace("# tasks-api\n", "# tasks-api\n\n\n\n\n\n");
  assert.deepEqual(f(far, opts), ["badge"]);
  assert.deepEqual(f(GOOD.replace("/docs", ""), opts), ["live-link"]);
  assert.deepEqual(f(GOOD.replace("Docker (Render)", "Render"), opts), ["architecture"]);
  assert.deepEqual(f(GOOD + "\n<meta name=\"api-url\" content=\"https://YOUR-SERVICE.onrender.com\">", opts), ["placeholder"]);
  assert.deepEqual(f(GOOD, { ...opts, repo: "other" }), ["badge"]);
});
