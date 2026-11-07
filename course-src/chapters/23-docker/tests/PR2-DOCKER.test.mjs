import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { docker, dockerAvailable, parseDockerfile, readText, tail, waitForHttp } from "../../tools/docker.mjs";

// פרויקט 2, שלב ו׳: כל המערכת עולה בפקודה אחת — docker compose up --build
const project = path.dirname(target(import.meta.url, "tasks-api/package.json"));
const file = (f) => path.join(project, f);

test("Dockerfile", () => {
  const steps = parseDockerfile(readText(file("Dockerfile")));
  const froms = steps.filter((s) => s.cmd === "FROM");
  assert.ok(froms.length >= 2, "multi-stage: לפחות שני FROM (build ו־runtime)");
  assert.ok(froms.every((f) => /node:24/.test(f.args)), "FROM node:24 (או node:24-alpine) בכל השלבים");
  const last = froms.length - 1;
  const first = steps.filter((s) => s.stage === 0);
  const idx = (re) => first.findIndex((s) => re.test(`${s.cmd} ${s.args}`));
  const copyPkg = idx(/^COPY .*package(-lock)?\.json/);
  const install = idx(/^RUN .*npm (ci|install)/);
  const copyAll = idx(/^COPY \.\s+\.?/);
  assert.ok(copyPkg !== -1 && install > copyPkg && copyAll > install, "בשלב הראשון: COPY package*.json ← RUN npm ci ← COPY . . (בשביל ה־cache)");
  const final = steps.filter((s) => s.stage === last);
  const user = final.filter((s) => s.cmd === "USER").at(-1);
  assert.ok(user && !/^(root|0)(:|$)/.test(user.args), "בשלב האחרון: USER שאינו root");
  assert.ok(!final.some((s) => s.cmd === "COPY" && /^\.\s/.test(s.args) && !/--from/.test(s.args)), "בשלב האחרון לא מעתיקים את כל התיקייה (COPY . .) — רק מה שצריך");
  assert.ok(final.some((s) => s.cmd === "CMD" || s.cmd === "ENTRYPOINT"), "CMD בשלב האחרון");
});

test(".dockerignore", () => {
  const lines = readText(file(".dockerignore")).split(/\r?\n/).map((l) => l.trim());
  for (const must of ["node_modules", ".env"]) {
    assert.ok(lines.some((l) => l === must || l === `/${must}` || l === `${must}/`), `.dockerignore צריך לכלול ${must}`);
  }
});

test("compose: כל המערכת עולה, עובדת, והנתונים נשמרים", { timeout: 900000 }, async (t) => {
  assert.ok(fs.existsSync(file("compose.yaml")) || fs.existsSync(file("docker-compose.yml")), "לא נמצא compose.yaml");
  if (!dockerAvailable()) {
    t.skip("Docker לא רץ — הפעל את Docker Desktop והרץ שוב (הבדיקות הסטטיות עברו)");
    return;
  }
  const port = 21000 + (process.pid % 2000);
  const env = { JWT_SECRET: "pr2-docker-check-secret-0123456789-abcdef", API_PORT: String(port), WEB_PORT: String(port + 1) };
  const name = `pr2check${process.pid}`;
  const compose = (args, timeout) => docker(["compose", "-p", name, ...args], { cwd: project, env, timeout });

  const config = compose(["config", "--format", "json"]);
  assert.ok(config.ok, `docker compose config נכשל:\n${tail(config.output)}`);
  const services = JSON.parse(config.stdout).services;
  const db = Object.values(services).find((s) => /postgres/.test(s.image ?? ""));
  assert.ok(db, "שירות של PostgreSQL (image: postgres:18-alpine)");
  assert.ok(db.healthcheck?.test, "ל־db צריך healthcheck (pg_isready)");
  assert.ok((db.volumes ?? []).some((v) => v.type === "volume" && /^\/var\/lib\/postgresql\/?$/.test(v.target)), "volume בשם (named volume) ל־/var/lib/postgresql — ב־PostgreSQL 18 זה הנתיב");
  const api = services.api;
  assert.ok(api, "שירות בשם api");
  assert.ok((api.ports ?? []).some((p) => String(p.published) === String(port) && p.target === 3000), "ה־port של api: \"${API_PORT:-3000}:3000\" — כך הבודק מריץ על port אחר");
  assert.ok(Object.values(api.depends_on ?? {}).some((d) => /service_(healthy|completed_successfully)/.test(d.condition)), "api צריך depends_on עם condition (service_healthy או service_completed_successfully)");

  t.after(() => compose(["down", "-v"], 120000));
  const up = compose(["up", "-d", "--build", "--wait"], 600000);
  assert.ok(up.ok, `docker compose up נכשל:\n${tail(up.output, 40)}\n\n${tail(compose(["logs", "--no-color"]).output, 30)}`);

  const base = `http://localhost:${port}`;
  await waitForHttp(`${base}/health`);
  const call = async (method, p, body, token) => {
    const res = await fetch(base + p, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body && JSON.stringify(body) });
    return { status: res.status, body: await res.json().catch(() => null) };
  };
  assert.equal((await call("POST", "/auth/register", { email: "dana@example.com", password: "dana-password-1" })).status, 201, "הרשמה (ה־migrations רצו?)");
  const login = await call("POST", "/auth/login", { email: "dana@example.com", password: "dana-password-1" });
  assert.equal(login.status, 200);
  assert.equal((await call("POST", "/tasks", { title: "מתוך Docker" }, login.body.accessToken)).status, 201);

  const uid = compose(["exec", "-T", "api", "id", "-u"]);
  assert.ok(uid.ok && uid.stdout.trim() !== "0", `ה־api רץ כ־root (uid ${uid.stdout.trim()})`);

  const down = compose(["down"], 120000);
  assert.ok(down.ok, tail(down.output));
  const again = compose(["up", "-d", "--wait"], 300000);
  assert.ok(again.ok, `up שני נכשל:\n${tail(again.output)}`);
  await waitForHttp(`${base}/health`);
  const relogin = await call("POST", "/auth/login", { email: "dana@example.com", password: "dana-password-1" });
  assert.equal(relogin.status, 200, "אחרי down ו־up — המשתמש עדיין קיים (volume)");
  const tasks = await call("GET", "/tasks", undefined, relogin.body.accessToken);
  assert.deepEqual(tasks.body.data.map((x) => x.title), ["מתוך Docker"], "והמשימה עדיין שם");
});
