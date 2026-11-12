import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import YAML from "yaml";
import { target } from "../../tools/load.mjs";

const text = fs.readFileSync(target(import.meta.url, "P26.3-E99.yml"), "utf8");
const wf = YAML.parse(text) ?? {};
const steps = (job) => wf.jobs?.[job]?.steps ?? [];
const runs = (job) => steps(job).map((s) => s.run ?? "").join("\n");

test("טריגר והרשאות", () => {
  const on = wf.on ?? wf[true];
  assert.ok(on?.push, "on: push");
  assert.deepEqual(on.push.branches, ["main"]);
  assert.equal(wf.permissions?.contents, "read", "permissions: contents: read ברמת ה־workflow");
});
test("build: login ו־push עם ה־sha", () => {
  const b = wf.jobs?.build;
  assert.ok(b, "job בשם build");
  assert.equal(b.permissions?.packages, "write");
  assert.ok(steps("build").some((s) => /^actions\/checkout@/.test(s.uses ?? "")));
  assert.match(text, /secrets\.GITHUB_TOKEN/);
  assert.match(runs("build"), /docker push ghcr\.io\/noa-cohen\/coffee-shop:\$\{\{\s*github\.sha\s*\}\}/);
});
test("update-config: אחרי build, checkout של repo התצורה, commit ו־push", () => {
  const u = wf.jobs?.["update-config"];
  assert.ok(u, "job בשם update-config");
  assert.ok([].concat(u.needs ?? []).includes("build"), "needs: build");
  const co = steps("update-config").find((s) => /^actions\/checkout@/.test(s.uses ?? ""));
  assert.equal(co?.with?.repository, "noa-cohen/coffee-deploy");
  assert.match(String(co?.with?.token ?? ""), /secrets\.CONFIG_REPO_TOKEN/);
  const r = runs("update-config");
  assert.match(r, /values-staging\.yaml/);
  assert.match(r, /git[^\n]*commit/);
  assert.match(r, /git push/);
  assert.doesNotMatch(text, /kubectl|helm\s/, "בלי kubectl ובלי helm");
});
