import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { packageRisk } = await load(import.meta.url, "P30-E98.ts");
const NOW = new Date("2026-11-16T12:00:00Z");
const REG = {
  "express-rate-limit": { createdAt: "2016-01-01", weeklyDownloads: 9_000_000, repository: "github.com/express-rate-limit/express-rate-limit" },
  "express-rate-limiter-pro": { createdAt: "2026-11-09", weeklyDownloads: 40 },
  "expres": { createdAt: "2020-01-01", weeklyDownloads: 50_000, repository: "" },
  express: { createdAt: "2010-01-01", weeklyDownloads: 40_000_000, repository: "github.com/expressjs/express" },
  zod: { createdAt: "2020-03-01", weeklyDownloads: 20_000_000, repository: "github.com/colinhacks/zod" },
  "my-tiny-lib": { createdAt: "2026-10-01", weeklyDownloads: 999, repository: "github.com/me/lib" },
};
const POP = ["express", "zod", "express-rate-limit", "pg"];

test("כל הסיכונים", () => {
  assert.deepEqual(packageRisk("express-rate-limit", REG, POP, NOW), []);
  assert.deepEqual(packageRisk("express-rate-limiter-pro", REG, POP, NOW), ["new", "low_downloads", "no_repo"]);
  assert.deepEqual(packageRisk("expres", REG, POP, NOW), ["no_repo", "typosquat:express"]);
  assert.deepEqual(packageRisk("my-tiny-lib", REG, POP, NOW), ["low_downloads"], "‏46 ימים — לא חדשה");
  assert.deepEqual(packageRisk("left-padd", REG, POP, NOW), ["not_found"]);
  assert.deepEqual(packageRisk("constructor", REG, POP, NOW), ["not_found"]);
});
test("Levenshtein: 1–2 בלבד, הראשון ברשימה", () => {
  const reg = { zo: { createdAt: "2019-01-01", weeklyDownloads: 5000, repository: "x" }, zodd: { createdAt: "2019-01-01", weeklyDownloads: 5000, repository: "x" }, "expresss-x": { createdAt: "2019-01-01", weeklyDownloads: 5000, repository: "x" } };
  assert.deepEqual(packageRisk("zo", reg, POP, NOW), ["typosquat:zod"], "‏zo: מרחק 1 מ־zod ו־2 מ־pg — zod ראשון ברשימה");
  assert.deepEqual(packageRisk("pq", { pq: reg.zo }, POP, NOW), ["typosquat:pg"]);
  assert.deepEqual(packageRisk("zodd", reg, POP, NOW), ["typosquat:zod"]);
  assert.deepEqual(packageRisk("expresss-x", reg, POP, NOW), [], "מרחק 3");
});
