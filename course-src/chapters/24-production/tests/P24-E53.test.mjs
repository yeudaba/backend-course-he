import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { target } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E53.ts", ["addBusinessDays", "businessDaysBetween"]);

test("addBusinessDays — ישראל (שישי־שבת)", async () => {
  const { addBusinessDays } = await get();
  assert.equal(addBusinessDays("2026-11-05", 3), "2026-11-10", "חמישי + 3 ← שלישי");
  assert.equal(addBusinessDays("2026-11-05", 1), "2026-11-08", "חמישי + 1 ← ראשון");
  assert.equal(addBusinessDays("2026-11-06", 1), "2026-11-08", "משישי");
  assert.equal(addBusinessDays("2026-11-07", 1), "2026-11-08", "משבת");
  assert.equal(addBusinessDays("2026-11-06", 0), "2026-11-06");
  assert.equal(addBusinessDays("2026-03-26", 1), "2026-03-29", "דרך סוף השבוע של שעון הקיץ");
  assert.equal(addBusinessDays("2026-12-30", 3), "2027-01-04", "מעבר שנה");
  assert.equal(addBusinessDays("2028-02-28", 1), "2028-02-29", "שנה מעוברת");
  assert.equal(addBusinessDays("2026-11-02", 10), "2026-11-16");
});
test("weekend אחר", async () => {
  const { addBusinessDays, businessDaysBetween } = await get();
  assert.equal(addBusinessDays("2026-11-05", 1, [0, 6]), "2026-11-06", "שבת־ראשון: חמישי + 1 ← שישי");
  assert.equal(addBusinessDays("2026-11-06", 1, [0, 6]), "2026-11-09");
  assert.equal(businessDaysBetween("2026-11-01", "2026-11-08", []), 7);
});
test("n לא תקין", async () => {
  const { addBusinessDays } = await get();
  for (const n of [-1, 1.5, NaN]) assert.throws(() => addBusinessDays("2026-11-05", n), RangeError, String(n));
});
test("businessDaysBetween", async () => {
  const { businessDaysBetween } = await get();
  assert.equal(businessDaysBetween("2026-11-05", "2026-11-10"), 3);
  assert.equal(businessDaysBetween("2026-11-05", "2026-11-07"), 0, "רק שישי ושבת");
  assert.equal(businessDaysBetween("2026-11-05", "2026-11-05"), 0);
  assert.equal(businessDaysBetween("2026-11-10", "2026-11-05"), 0);
  assert.equal(businessDaysBetween("2026-11-01", "2026-11-30"), 21);
});
test("לא תלוי ב־TZ של המחשב", () => {
  const file = target(import.meta.url, "P24-E53.ts");
  const code = `const m = await import(${JSON.stringify(pathToFileURL(file).href)}); console.log(m.addBusinessDays("2026-11-05", 3), m.businessDaysBetween("2026-11-05", "2026-11-10"), m.addBusinessDays("2026-03-26", 1));`;
  for (const tz of ["America/Los_Angeles", "Pacific/Kiritimati", "Asia/Jerusalem"]) {
    const r = spawnSync(process.execPath, ["--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", code], { encoding: "utf8", env: { ...process.env, TZ: tz } });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim().split("\n").at(-1), "2026-11-10 3 2026-03-29", `עם TZ=${tz}`);
  }
});
