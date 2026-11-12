import { test } from "node:test";
import assert from "node:assert/strict";
import { readJenkinsfile, child, stages, stage, allStmts, stageIndex } from "./_jenkins.mjs";

const { pipeline, text } = readJenkinsfile(import.meta.url, "P26.3-E91.Jenkinsfile");
const when = (re) => child(stage(pipeline, re)?.node, "when");

test("agent, environment, ו־stages בסדר", () => {
  assert.match(allStmts(child(pipeline, "agent") ?? { stmts: [], children: [] }).join("\n"), /image\s+['"]node:24/, "agent { docker { image 'node:24-alpine' } }");
  assert.match(allStmts(child(pipeline, "environment") ?? { stmts: [], children: [] }).join("\n"), /IMAGE\s*=\s*['"]ghcr\.io\/noa-cohen\/coffee-shop['"]/);
  const order = [/^test$/i, /push/i, /update.*config|config/i].map((re) => stageIndex(pipeline, re));
  assert.ok(order.every((i) => i >= 0), `צריך stages: Test, Push image, Update config (יש: ${stages(pipeline).map((s) => s.name).join(", ")})`);
  assert.deepEqual([...order].sort((a, b) => a - b), order, "בסדר הזה");
  const t = allStmts(stage(pipeline, /^test$/i).node).join("\n");
  assert.match(t, /npm ci/);
  assert.match(t, /npm test/);
});
test("Push image ו־Update config — רק ב־main", () => {
  for (const re of [/push/i, /config/i]) assert.ok(when(re)?.stmts.some((s) => /^branch\s+['"]main['"]$/.test(s)), `${re}: when { branch 'main' }`);
  const push = allStmts(stage(pipeline, /push/i).node).join("\n");
  assert.match(push, /credentialsId:\s*['"]ghcr['"]/);
  assert.match(push, /--password-stdin/);
  assert.match(push, /docker push \$\{?IMAGE\}?:\$\{?GIT_COMMIT\}?/);
});
test("Update config: credentials, clone, values-staging, commit ו־push", () => {
  const all = allStmts(stage(pipeline, /config/i).node).join("\n");
  assert.match(all, /usernamePassword\(\s*credentialsId:\s*['"]config-repo['"]/);
  assert.match(all, /usernameVariable:\s*['"]GIT_USER['"]/);
  assert.match(all, /passwordVariable:\s*['"]GIT_TOKEN['"]/);
  assert.match(all, /git clone[^\n]*github\.com\/noa-cohen\/coffee-deploy/);
  assert.match(all, /values-staging\.yaml/);
  assert.match(all, /git[^\n]*commit/);
  assert.match(all, /git push/);
});
test("סודות במרכאות בודדות, ובלי גישה ל־cluster", () => {
  for (const s of [...allStmts(stage(pipeline, /push/i).node), ...allStmts(stage(pipeline, /config/i).node)]) {
    if (/^sh\s+"/.test(s)) assert.doesNotMatch(s, /GIT_TOKEN|REG_TOKEN|PASSWORD/, `sh במרכאות כפולות עם סוד: ${s.slice(0, 80)}`);
  }
  assert.doesNotMatch(text, /kubectl|helm\s+(upgrade|install)/, "Jenkins לא נוגע ב־cluster — Argo CD מסנכרן");
  assert.ok(child(child(pipeline, "post"), "failure"), "post { failure { … } }");
});
