import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P07-E84.js";
const get = () => exportsOf(import.meta.url, FILE, ["addDays"]);

// Node מאפשר להחליף אזור זמן בזמן ריצה — כך בודקים שהתוצאה לא תלויה במחשב
function inZone(tz, fn) {
  const before = process.env.TZ;
  process.env.TZ = tz;
  try {
    return fn();
  } finally {
    if (before === undefined) delete process.env.TZ;
    else process.env.TZ = before;
  }
}

test("הדוגמאות מהמשימה", async () => {
  const { addDays } = await get();
  assert.equal(addDays("2026-02-27", 3), "2026-03-02");
  assert.equal(addDays("2026-12-30", 5), "2027-01-04");
  assert.equal(addDays("2026-03-10", -10), "2026-02-28");
  assert.equal(addDays("2026-05-05", 0), "2026-05-05");
});
test("לא תאריך ← null", async () => {
  const { addDays } = await get();
  assert.equal(addDays("abc", 1), null);
  assert.equal(addDays("2026-13-01", 1), null, "חודש 13 לא קיים");
});
test("אותה תוצאה בכל אזור זמן (גם במעבר לשעון קיץ)", async () => {
  const { addDays } = await get();
  for (const tz of ["UTC", "Asia/Jerusalem", "America/Los_Angeles", "Pacific/Kiritimati"]) {
    inZone(tz, () => {
      assert.equal(addDays("2026-03-26", 2), "2026-03-28", `ב־${tz}: 26.3 + 2 (שעון קיץ בישראל ב־27.3)`);
      assert.equal(addDays("2026-03-07", 2), "2026-03-09", `ב־${tz}: 7.3 + 2 (שעון קיץ בארה"ב ב־8.3)`);
      assert.equal(addDays("2026-10-24", 1), "2026-10-25", `ב־${tz}: 24.10 + 1`);
      assert.equal(addDays("2026-01-31", 1), "2026-02-01", `ב־${tz}: סוף חודש`);
    });
  }
});
