import { test } from "node:test";
import assert from "node:assert/strict";
import { readJenkinsfile, child, stage, allStmts } from "./_jenkins.mjs";

const { pipeline, text } = readJenkinsfile(import.meta.url, "P25.5-E23.Jenkinsfile");

test("באג 1: אין סוד בקובץ — credentials מ־Jenkins", () => {
  assert.doesNotMatch(text, /ghp_[A-Za-z0-9]{10,}/, "token בקובץ = token ב־git, לנצח");
  assert.match(text, /credentials\(\s*['"]ghcr['"]\s*\)|credentialsId:\s*['"]ghcr['"]/, "credentials('ghcr') או withCredentials עם credentialsId: 'ghcr'");
  for (const s of allStmts(pipeline)) {
    if (/^sh\s+"/.test(s)) assert.doesNotMatch(s, /\$\{?REG|TOKEN|PSW/, `מרכאות כפולות = Groovy מכניס את הסוד: ${s}`);
  }
});
test("באג 2: npm ci", () => {
  const sh = allStmts(stage(pipeline, /install/i).node).join("\n");
  assert.match(sh, /npm ci/);
  assert.doesNotMatch(sh, /npm install/);
});
test("באג 3: push רק מ־main", () => {
  const when = child(stage(pipeline, /push/i).node, "when");
  assert.ok(when?.stmts.some((s) => /^branch\s+['"]main['"]$/.test(s)), "when { branch 'main' } — אחרת כל ענף של feature מעלה image");
});
test("באג 4: timeout", () => {
  assert.ok(child(pipeline, "options")?.stmts.some((s) => /^timeout\s*\(/.test(s)), "options { timeout(time: 20, unit: 'MINUTES') }");
});
test("השלבים עדיין שם", () => {
  for (const re of [/install/i, /test/i, /push/i]) assert.ok(stage(pipeline, re), String(re));
  assert.match(allStmts(stage(pipeline, /push/i).node).join("\n"), /docker push/);
});
