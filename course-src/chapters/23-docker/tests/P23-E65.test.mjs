import { test } from "node:test";
import assert from "node:assert/strict";
import { steps, find } from "./_dockerfile.mjs";

const stage = (s, n) => s.filter((x) => x.stage === n);

test("שלב build: התקנה, בדיקות, קומפילציה — בסדר", () => {
  const s = steps(import.meta.url, "P23-E65");
  assert.equal(s.filter((x) => x.cmd === "FROM").length, 2, "שני שלבים");
  const b = stage(s, 0);
  assert.match(b[0].args, /^node:24-alpine\s+AS\s+build$/i, "FROM node:24-alpine AS build");
  const order = [find(b, "COPY", /^package\.json\s+package-lock\.json/), find(b, "RUN", /^npm ci$/), find(b, "COPY", /^\.\s+\.\/?$/), find(b, "RUN", /^npm (run )?test$/), find(b, "RUN", /^npm run build$/)];
  assert.ok(order.every((i) => i !== -1), "בשלב build: COPY package*.json, RUN npm ci, COPY . ., RUN npm test, RUN npm run build");
  assert.deepEqual([...order].sort((a, c) => a - c), order, "הסדר: package*.json ← npm ci ← COPY . . ← npm test ← npm run build");
  assert.ok(!b.some((x) => /\|\|\s*true/.test(x.args)), "בלי || true — בדיקה שנכשלת צריכה לעצור את ה־build");
});
test("שלב אחרון: רק מה שצריך לרוץ", () => {
  const s = steps(import.meta.url, "P23-E65");
  const r = stage(s, 1);
  assert.equal(r[0].args, "node:24-alpine");
  assert.ok(find(r, "ENV", /^NODE_ENV[= ]production$/) !== -1, "ENV NODE_ENV=production");
  assert.ok(find(r, "RUN", /npm ci --omit=dev/) !== -1, "npm ci --omit=dev");
  assert.ok(find(r, "COPY", /^--from=build\s+\/app\/dist\s+\.\/dist\/?$/) !== -1, "COPY --from=build /app/dist ./dist");
  assert.equal(find(r, "COPY", /^\.\s+\./), -1, "בלי COPY . . בשלב האחרון");
  assert.equal(find(r, "RUN", /npm (run )?test/), -1, "בדיקות רק בשלב build");
  assert.ok(find(r, "USER", /^node$/) !== -1, "USER node");
  const cmd = r.filter((x) => x.cmd === "CMD").at(-1);
  assert.deepEqual(JSON.parse(cmd?.args ?? "null"), ["node", "dist/main.js"]);
});
