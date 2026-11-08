import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import { projectDir, startApp } from "../../tools/app.mjs";

// פרויקט 3, שלב 4: מה שהופך קוד למוצר — Docker, CI, README, דף, בדיקות ו־Swagger
const dir = projectDir(import.meta.url);
const read = (f) => {
  const p = path.join(dir, f);
  assert.ok(fs.existsSync(p), `לא נמצא ${f}`);
  return fs.readFileSync(p, "utf8");
};
const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (["node_modules", "dist", "generated", ".git"].includes(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)])) : []);

test("Docker", () => {
  const df = read("Dockerfile");
  assert.ok((df.match(/^FROM\s/gim) ?? []).length >= 2, "multi-stage (שני FROM לפחות)");
  assert.match(df, /^USER\s+(?!root)\S+/im, "USER שאינו root");
  const ignore = read(".dockerignore");
  for (const x of ["node_modules", ".env"]) assert.ok(ignore.split("\n").some((l) => l.trim().startsWith(x)), `.dockerignore: ${x}`);
  const compose = parseYaml(read("compose.yaml"));
  const services = Object.values(compose.services ?? {});
  const db = services.find((s) => /^postgres:18/.test(s.image ?? ""));
  assert.ok(db, "compose: שירות postgres:18");
  assert.ok(db.healthcheck, "compose: healthcheck למסד");
  assert.ok([db.volumes].flat().some((v) => String(v).endsWith(":/var/lib/postgresql")), "volume ב־/var/lib/postgresql (PostgreSQL 18)");
  const api = services.find((s) => s.build && s.ports);
  assert.ok(api, "compose: שירות של ה־API (build + ports)");
  assert.ok(Object.values(api.depends_on ?? {}).some((d) => d?.condition), "ה־API מחכה עם condition (מסד healthy / migrations הסתיימו)");
});

test("CI", () => {
  const wf = parseYaml(read(".github/workflows/ci.yml"));
  const on = wf.on ?? wf[true];
  assert.ok(on?.push && on?.pull_request, "רץ על push ועל pull_request");
  const job = Object.values(wf.jobs).find((j) => j.services && Object.values(j.services).some((s) => /^postgres/.test(s.image)));
  assert.ok(job, "job עם שירות postgres");
  const runs = job.steps.map((s) => s.run ?? "").join("\n");
  for (const re of [/npm ci/, /prisma generate/, /npm (run )?test\b/, /migrate deploy/, /test:e2e|test:int/]) assert.match(runs, re, `צעד: ${re.source}`);
});

test("README", () => {
  const md = read("README.md");
  assert.match(md, /https:\/\/[^\s)]+/, "קישור חי (https)");
  assert.match(md, /\/docs/, "קישור ל־Swagger (/docs)");
  const diagrams = (md.match(/```mermaid/g) ?? []).length + (md.match(/!\[[^\]]*\]\((?![^)]*badge)[^)]+\.(png|svg|jpg)\)/gi) ?? []).length;
  assert.ok(diagrams >= 2, "שני תרשימים לפחות: ארכיטקטורה ומסד נתונים (mermaid או תמונה)");
  const local = /##[^\n]*הרצה[\s\S]*?```(?:bash|sh|shell)?\n([\s\S]*?)```/.exec(md);
  assert.ok(local, "סעיף הרצה מקומית עם בלוק פקודות");
  const commands = local[1].split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  assert.ok(commands.length <= 3, `הרצה מקומית — עד 3 פקודות (נמצאו ${commands.length})`);
  const decisions = /##[^\n]*החלטות טכניות[^\n]*\n([\s\S]*?)(?=\n## |$)/.exec(md);
  assert.ok(decisions, "סעיף \"החלטות טכניות\" — החלק שמראיינים קוראים");
  assert.ok((decisions[1].match(/^\s*[-*]\s+/gm) ?? []).length >= 3, "לפחות 3 החלטות");
  assert.match(decisions[1], /transaction|טרנזקצי|UPDATE/i, "ההחלטה על המלאי במקביל");
  assert.match(md, /##[^\n]*(מה הייתי משפר|עם עוד זמן)/, "סעיף \"מה הייתי משפר\"");
});

test("דף ההדגמה", () => {
  const html = read("web/index.html");
  assert.match(html, /<script[^>]+src=/, "web/index.html עם script");
  const js = walk(path.join(dir, "web")).filter((f) => f.endsWith(".js")).map((f) => fs.readFileSync(f, "utf8")).join("\n");
  assert.match(js, /fetch\(/, "fetch ל־API");
  assert.match(js, /\/products/, "מציג מוצרים");
  assert.match(js, /Idempotency-Key/i, "הזמנה עם Idempotency-Key — לחיצה כפולה לא יוצרת שתי הזמנות");
});

test("הבדיקות של הפרויקט", () => {
  const files = walk(dir).filter((f) => /\.(spec|e2e-spec|int-spec)\.ts$/.test(f));
  assert.ok(files.some((f) => /src\//.test(f)), "בדיקות unit ב־src/");
  const e2e = files.filter((f) => /e2e-spec|int-spec/.test(f));
  assert.ok(e2e.length >= 1, "בדיקות e2e (test/*.e2e-spec.ts)");
  const text = e2e.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  assert.match(text, /Promise\.all/, "תרחיש המרוץ: בקשות במקביל (Promise.all) בבדיקות ה־e2e");
});

test("Swagger, ready ו־version", async (t) => {
  const { call } = await startApp(t, import.meta.url);
  const r = await call("GET", "/docs");
  assert.equal(r.status, 200, "GET /docs — Swagger UI");
  assert.equal((await call("GET", "/ready")).status, 200, "/ready מול המסד");
  const v = await call("GET", "/version");
  assert.equal(v.status, 200, "/version");
  assert.ok(v.body.version, "version");
});
