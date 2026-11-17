import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { changedTargets } = await load(import.meta.url, "P26.3-E101.ts");

test("מיפוי", () => {
  assert.deepEqual(changedTargets(["README.md", "docs/arch.png", "web/README.md"]), []);
  assert.deepEqual(changedTargets(["src/orders/orders.service.ts", "src/app.ts"]), ["api"]);
  assert.deepEqual(changedTargets(["web/index.html", "charts/coffee-api/values.yaml", "Jenkinsfile"]), ["chart", "ci", "web"]);
  assert.deepEqual(changedTargets([".github/workflows/ci.yml", "package.json", "prisma/schema.prisma"]), ["api", "ci"]);
  assert.deepEqual(changedTargets(["tsconfig.json"]), ["api"], "לא מוכר ← api");
  assert.deepEqual(changedTargets(["webby/x.ts", "Dockerfile"]), ["api"], "webby/ הוא לא web/");
  assert.deepEqual(changedTargets([]), []);
});
