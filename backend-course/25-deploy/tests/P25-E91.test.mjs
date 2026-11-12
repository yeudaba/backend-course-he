import { test } from "node:test";
import assert from "node:assert/strict";
import { readWorkflow, steps, stepIndex } from "./_workflow.mjs";

const { wf, on, text } = readWorkflow(import.meta.url, "P25-E91.yml");
const deploy = wf.jobs?.deploy;
const norm = (v) => String(v ?? "").replace(/\s+/g, "");

test("מבנה כללי", () => {
  assert.deepEqual([on?.push?.branches].flat(), ["main"]);
  assert.deepEqual(wf.permissions, { contents: "read" });
  assert.equal(wf.env, undefined, "בלי env ברמת הקובץ");
  assert.ok(wf.jobs.test && wf.jobs.docker && deploy, "jobs: test, docker, deploy");
});
test("deploy — מתי ואחרי מה", () => {
  assert.deepEqual([deploy.needs].flat().sort(), ["docker", "test"]);
  const cond = String(deploy.if ?? "").replace(/\$\{\{|\}\}/g, "").replace(/\s+/g, " ");
  assert.match(cond, /github\.event_name == 'push'/);
  assert.match(cond, /github\.ref == 'refs\/heads\/main'/);
  assert.equal(deploy.environment === "production" || deploy.environment?.name === "production", true, "environment: production");
  assert.ok(Number(deploy["timeout-minutes"]) > 0);
  assert.equal(deploy.env, undefined, "בלי env ברמת ה־job — כל סוד רק בצעד שלו");
});
test("הצעדים, בסדר", () => {
  const s = steps(deploy);
  assert.match(s[0]?.uses ?? "", /^actions\/checkout@v\d+$/);
  const node = stepIndex(deploy, /^actions\/setup-node@v\d+/);
  assert.ok(node > 0);
  assert.equal(String(s[node].with?.["node-version"]), "24");
  const ci = stepIndex(deploy, /^npm ci$/);
  const migrate = stepIndex(deploy, /prisma migrate deploy/);
  const hook = stepIndex(deploy, /\bcurl\b/);
  const smoke = stepIndex(deploy, /node scripts\/smoke\.mjs/);
  assert.ok(node < ci && ci < migrate && migrate < hook && hook < smoke, "setup-node ← npm ci ← migrate ← hook ← smoke");
});
test("סודות ומשתנים — רק איפה שצריך", () => {
  const s = steps(deploy);
  const migrate = s[stepIndex(deploy, /prisma migrate deploy/)];
  assert.equal(norm(migrate.env?.DATABASE_URL), norm("${{ secrets.DATABASE_URL }}"));
  const hook = s[stepIndex(deploy, /\bcurl\b/)];
  assert.equal(norm(hook.env?.RENDER_DEPLOY_HOOK_URL), norm("${{ secrets.RENDER_DEPLOY_HOOK_URL }}"));
  assert.doesNotMatch(hook.run, /secrets\./, "הסוד דרך env, לא בתוך run");
  assert.match(hook.run, /\$RENDER_DEPLOY_HOOK_URL|\$\{RENDER_DEPLOY_HOOK_URL\}/);
  assert.match(hook.run, /(^|\s)-[a-zA-Z]*f/, "curl -f");
  const smoke = s[stepIndex(deploy, /node scripts\/smoke\.mjs/)];
  assert.equal(norm(smoke.env?.BASE_URL), norm("${{ vars.PRODUCTION_URL }}"));
  assert.equal(norm(smoke.env?.EXPECT_COMMIT), norm("${{ github.sha }}"));
  const secretUses = [...text.matchAll(/secrets\.[A-Z_]+/g)].length;
  assert.equal(secretUses, 2, "בדיוק שני שימושים בסודות בכל הקובץ");
  for (const name of ["test", "docker"]) assert.doesNotMatch(JSON.stringify(wf.jobs[name]), /secrets\./, `${name} בלי סודות`);
});
