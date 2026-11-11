import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, code } from "./_ts.mjs";

const FILE = "P26.3-E27.ts";
const get = () => exportsOf(import.meta.url, FILE, ["tieredCost", "s3Bill"]);
const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ציפינו ל־${b}, קיבלנו ${a}`);
const TIERS = [
  { upTo: 10, price: 1 },
  { upTo: 30, price: 0.5 },
  { upTo: null, price: 0.25 },
];

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("tieredCost — כל מדרגה במחיר שלה", async () => {
  const { tieredCost } = await get();
  close(tieredCost(0, TIERS), 0, "0 יחידות");
  close(tieredCost(4, TIERS), 4, "בתוך המדרגה הראשונה");
  close(tieredCost(10, TIERS), 10, "בדיוק בגבול");
  close(tieredCost(11, TIERS), 10.5, "10 × 1 + 1 × 0.5 — לא 11 × 0.5");
  close(tieredCost(30, TIERS), 20, "10 + 20 × 0.5");
  close(tieredCost(130, TIERS), 45, "10 + 10 + 100 × 0.25");
  close(tieredCost(2.5, TIERS), 2.5, "שברים");
  close(tieredCost(50, [{ upTo: null, price: 2 }]), 100, "מדרגה אחת");
  for (const bad of [-1, NaN]) assert.throws(() => tieredCost(bad, TIERS), RangeError, String(bad));
});
test("s3Bill — לפי המחירים שבמשימה, מעוגל לסנטים", async () => {
  const { s3Bill } = await get();
  assert.deepEqual(s3Bill({ storageGb: 1_200, putRequests: 2_000_000, getRequests: 30_000_000, transferOutGb: 900 }), { storage: 27.6, requests: 22, transfer: 72, total: 121.6 });
  assert.deepEqual(s3Bill({ storageGb: 60_000, putRequests: 0, getRequests: 0, transferOutGb: 80 }), { storage: 1371.2, requests: 0, transfer: 0, total: 1371.2 }, "51,200GB במחיר הראשון ו־8,800 בשני; 100GB הראשונים של תעבורה בחינם");
  assert.deepEqual(s3Bill({ storageGb: 600_000, putRequests: 1000, getRequests: 1000, transferOutGb: 20_000 }), { storage: 13_163.2, requests: 0.01, transfer: 1742.2, total: 14_905.41 });
});
test("לולאה על מערך המדרגות", () => {
  assert.match(code(import.meta.url, FILE), /\bfor\s*\(/, "tieredCost עם לולאה על המדרגות (פרק 4) — לא if לכל מדרגה");
});
