import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { apps, now } from "./_apps.mjs";

const { followUps } = await load(import.meta.url, "P30-E23.ts");

test("רק applied", () => {
  assert.ok(!followUps(apps, now).includes("Fiverr"), "Fiverr כבר דחו — לא שולחים תזכורת");
});
test("לפי העדכון האחרון, לא לפי תאריך ההגשה", () => {
  assert.ok(!followUps(apps, now).includes("Startup A"), "Startup A עודכנה לפני 3 ימים");
});
test("ימים אמיתיים, גם מעבר לחודש", () => {
  assert.deepEqual(followUps(apps, now), ["Startup E", "Wix", "Startup B"]);
  assert.deepEqual(followUps(apps, new Date("2026-11-30T09:00:00Z"), 7), ["Startup E", "Wix"]);
});
