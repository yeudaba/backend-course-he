import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { load } from "../../tools/load.mjs";

const { lintWorkflow } = await load(import.meta.url, "P25-E24.ts");
const rules = (yaml) => lintWorkflow(yaml).map((f) => `${f.job ?? "-"}:${f.rule}`).sort();

test("workflow תקין — בלי ממצאים (ה־CI של הפרויקט)", () => {
  const ci = fs.readFileSync(new URL("../solutions/tasks-api/.github/workflows/ci.yml", import.meta.url), "utf8");
  assert.deepEqual(lintWorkflow(ci), []);
});
test("YAML שבור", () => {
  assert.deepEqual(lintWorkflow("jobs:\n  a: [unclosed"), [{ job: null, rule: "yaml" }]);
});
test("כל הכללים", () => {
  const yaml = `
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout
      - uses: some/action@main
      - run: npm install
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    needs: [tset]
    steps:
      - run: echo ok
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - run: curl -X POST \${{ secrets.HOOK }}
`;
  assert.deepEqual(rules(yaml), [
    "-:permissions",
    "build:unknown-needs",
    "deploy:deploy-without-needs",
    "deploy:pr-secrets",
    "deploy:secret-in-run",
    "test:npm-install",
    "test:timeout",
    "test:unpinned-action",
  ]);
});
test("secret דרך env, ו־if של push — בסדר", () => {
  const yaml = `
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
permissions: { contents: read }
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps: [{ run: npm ci }]
  deploy:
    needs: test
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - run: curl -X POST "$HOOK"
        env: { HOOK: "\${{ secrets.HOOK }}" }
`;
  assert.deepEqual(rules(yaml), []);
});
test("pr-secrets רק כשיש pull_request", () => {
  const yaml = `
on: { push: { branches: [main] } }
permissions: { contents: read }
jobs:
  deploy:
    needs: []
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - run: curl "$H"
        env: { H: "\${{ secrets.H }}" }
`;
  assert.deepEqual(rules(yaml), ["deploy:deploy-without-needs"]);
});
