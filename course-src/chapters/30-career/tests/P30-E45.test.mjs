import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { packageIssues } = await load(import.meta.url, "P30-E45.ts");
const GOOD = {
  name: "coffee-shop-api",
  license: "MIT",
  engines: { node: ">=24" },
  scripts: { start: "node dist/main.js", test: "vitest run" },
  dependencies: { "@nestjs/core": "^12.0.0", pg: "^8.13.0" },
  devDependencies: { typescript: "^5.9.0", "@types/node": "^24.0.0" },
};

test("תקין ← []", () => assert.deepEqual(packageIssues(GOOD), []));
test("כל הבעיות, בסדר", () => {
  const bad = {
    name: "my-app",
    engines: {},
    scripts: { test: 'echo "Error: no test specified" && exit 1' },
    dependencies: { lodash: "*", typescript: "^5.0.0", "@types/express": "^5", express: "^5.0.0", jest: "latest" },
    devDependencies: { eslint: "", vitest: "^3" },
  };
  assert.deepEqual(packageIssues(bad), ["no-engines", "no-license", "no-test-script", "no-start-script", "loose:lodash", "loose:jest", "loose:eslint", "dev-in-deps:typescript", "dev-in-deps:@types/express", "dev-in-deps:jest"]);
});
test("שדות חסרים לגמרי", () => {
  assert.deepEqual(packageIssues({}), ["no-engines", "no-license", "no-test-script", "no-start-script"]);
  assert.deepEqual(packageIssues({ ...GOOD, scripts: { start: "x" } }), ["no-test-script"]);
  assert.deepEqual(packageIssues({ ...GOOD, dependencies: { "types-x": "^1", prettier: "^3" } }), ["dev-in-deps:prettier"]);
});
test("גרסה של רווחים בלבד — loose", () => {
  const pkg = structuredClone(GOOD);
  pkg.dependencies = { ...(pkg.dependencies ?? {}), lodash: "   " };
  assert.ok(packageIssues(pkg).includes("loose:lodash"));
});
