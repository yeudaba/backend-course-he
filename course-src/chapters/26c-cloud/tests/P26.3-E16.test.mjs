import { test } from "node:test";
import assert from "node:assert/strict";
import { readJenkinsfile, child, stages, stage, allStmts, stageIndex } from "./_jenkins.mjs";

const { pipeline, text } = readJenkinsfile(import.meta.url, "P26.3-E16.Jenkinsfile");

test("agent ב־Docker עם Node 24, ו־timeout", () => {
  const agent = child(pipeline, "agent");
  assert.ok(agent, "agent { … }");
  assert.match(allStmts(agent).join("\n"), /image\s+['"]node:24/, "agent { docker { image 'node:24-alpine' } }");
  const opts = child(pipeline, "options");
  assert.ok(opts?.stmts.some((s) => /^timeout\s*\(/.test(s)), "options { timeout(…) }");
});
test("השלבים, בסדר", () => {
  const order = [/install/i, /lint|type/i, /test/i, /build/i, /push/i].map((re) => stageIndex(pipeline, re));
  assert.ok(order.every((i) => i >= 0), `צריך stages: Install, Lint & Typecheck, Test, Build image, Push image (יש: ${stages(pipeline).map((s) => s.name).join(", ")})`);
  assert.deepEqual([...order].sort((a, b) => a - b), order, "בסדר הזה");
  const sh = (re) => allStmts(stage(pipeline, re).node).join("\n");
  assert.match(sh(/install/i), /sh\s+['"]npm ci['"]/);
  assert.match(sh(/lint|type/i), /npm run lint/);
  assert.match(sh(/lint|type/i), /npm run typecheck/);
  assert.match(sh(/^test/i), /npm test/);
  assert.match(sh(/build/i), /docker build/);
});
test("push: רק מ־main, ועם credentials של Jenkins", () => {
  const push = stage(pipeline, /push/i).node;
  const when = child(push, "when");
  assert.ok(when?.stmts.some((s) => /^branch\s+['"]main['"]$/.test(s)), "when { branch 'main' }");
  const all = allStmts(push).join("\n");
  assert.match(all, /withCredentials|credentials\(/, "withCredentials([...]) — או credentials('…') ב־environment");
  assert.match(all, /--password-stdin/, "docker login --password-stdin — לא -p (נראה ב־ps ובלוג)");
  assert.match(all, /docker push/);
});
test("סודות לא ב־Groovy interpolation", () => {
  for (const s of allStmts(stage(pipeline, /push/i).node)) {
    if (/^sh\s+"/.test(s)) assert.doesNotMatch(s, /\$\{?REG_|TOKEN|PASSWORD|PSW/, `sh עם מרכאות כפולות מכניס את הסוד למחרוזת של Groovy: ${s}`);
  }
  assert.doesNotMatch(text, /ghp_[A-Za-z0-9]{10,}/, "אין token בקובץ");
});
test("post: דוח בדיקות תמיד", () => {
  const post = child(pipeline, "post");
  assert.ok(child(post, "always"), "post { always { … } }");
});
