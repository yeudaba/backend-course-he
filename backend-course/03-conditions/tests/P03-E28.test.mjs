import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E28.js";
const parked = (m) => run(import.meta.url, FILE, { changes: [[/(minutesParked\s*=\s*)135\b/, `$1${m}`, "את השורה const minutesParked = 135;"]] });

test("135 דקות", () => sameOutput(run(import.meta.url, FILE), ["2:15 שעות חניה — לתשלום: 29.50 ₪"]));

for (const [m, line] of [
  [10, "0:10 שעות חניה — לתשלום: 0.00 ₪"],
  [15, "0:15 שעות חניה — לתשלום: 0.00 ₪"],
  [16, "0:16 שעות חניה — לתשלום: 12.00 ₪"],
  [60, "1:00 שעות חניה — לתשלום: 12.00 ₪"],
  [61, "1:01 שעות חניה — לתשלום: 15.50 ₪"],
  [75, "1:15 שעות חניה — לתשלום: 15.50 ₪"],
  [600, "10:00 שעות חניה — לתשלום: 80.00 ₪"],
]) {
  test(`${m} דקות`, () => sameOutput(parked(m), [line]));
}
