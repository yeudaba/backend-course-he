import { test } from "node:test";
import assert from "node:assert/strict";
import { steps, find } from "./_dockerfile.mjs";

test("מבנה וסדר", () => {
  const s = steps(import.meta.url, "P23-E59");
  assert.equal(s.filter((x) => x.cmd === "FROM").length, 1, "שלב אחד");
  assert.equal(s[0].cmd, "FROM");
  assert.equal(s[0].args, "node:24-alpine");
  assert.ok(find(s, "WORKDIR", /^\/app$/) !== -1, "WORKDIR /app");
  assert.ok(find(s, "ENV", /^NODE_ENV[= ]production$/) !== -1, "ENV NODE_ENV=production");
  assert.ok(find(s, "ENV", /^PORT[= ]8080$/) !== -1, "ENV PORT=8080");
  const copyPkg = find(s, "COPY", /^package\.json\s+package-lock\.json\s+\.\/?$/);
  const ci = find(s, "RUN", /npm ci --omit=dev/);
  const copySrc = find(s, "COPY", /^src\s+\.\/src\/?$/);
  assert.ok(copyPkg !== -1, "COPY package.json package-lock.json ./");
  assert.ok(ci !== -1, "RUN npm ci --omit=dev");
  assert.ok(copySrc !== -1, "COPY src ./src");
  assert.ok(copyPkg < ci && ci < copySrc, "הסדר: package*.json ← npm ci ← src (בשביל ה־cache)");
  assert.equal(find(s, "COPY", /^\.\s+\./), -1, "בלי COPY . .");
  assert.ok(!s.some((x) => x.cmd === "RUN" && /npm install/.test(x.args)), "npm ci, לא npm install");
});
test("משתמש, port, healthcheck, CMD", () => {
  const s = steps(import.meta.url, "P23-E59");
  const user = find(s, "USER", /^node$/);
  assert.ok(user !== -1, "USER node");
  assert.ok(user > find(s, "RUN", /npm ci/), "USER אחרי npm ci (אחרת אין הרשאה לכתוב ל־/app)");
  assert.ok(find(s, "EXPOSE", /^8080$/) !== -1, "EXPOSE 8080");
  const hc = s.find((x) => x.cmd === "HEALTHCHECK");
  assert.ok(hc, "HEALTHCHECK");
  assert.match(hc.args, /wget/);
  assert.match(hc.args, /127\.0\.0\.1:8080\/health/);
  const cmd = s.filter((x) => x.cmd === "CMD").at(-1);
  assert.ok(cmd, "CMD");
  assert.deepEqual(JSON.parse(cmd.args), ["node", "src/server.mjs"], "CMD בצורת מערך");
});
