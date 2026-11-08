import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { apps, now } from "./_apps.mjs";

const { pipelineStats } = await load(import.meta.url, "P30-E17.ts");

test("ספירה לפי שלב, שיעורי תגובה וראיון", () => {
  const r = pipelineStats(apps, now);
  assert.equal(r.total, 8);
  assert.deepEqual(r.byStage, { applied: 4, screen: 1, interview: 1, offer: 1, rejected: 1 });
  assert.equal(r.responseRate, 0.5);
  assert.equal(r.interviewRate, 0.25, "interview + offer");
});
test("מעקב: applied בלי עדכון 7 ימים — מהוותיק", () => {
  assert.deepEqual(pipelineStats(apps, now).followUps, ["Startup E", "Wix", "Startup B"]);
  assert.deepEqual(pipelineStats(apps, now, { followUpDays: 30 }).followUps, ["Startup E"]);
});
test("ריק", () => {
  assert.deepEqual(pipelineStats([], now), { total: 0, byStage: { applied: 0, screen: 0, interview: 0, offer: 0, rejected: 0 }, responseRate: 0, interviewRate: 0, followUps: [] });
});
