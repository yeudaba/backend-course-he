import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P28-E26.ts";
const get = () => exportsOf(import.meta.url, FILE, ["isStrong", "quorumWrite", "quorumRead"]);
const fresh = (n = 3) => Array.from({ length: n }, () => ({ up: true, version: 0, value: null }));

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("isStrong — R + W > N", async () => {
  const { isStrong } = await get();
  assert.equal(isStrong(3, 2, 2), true);
  assert.equal(isStrong(3, 1, 3), true);
  assert.equal(isStrong(3, 1, 2), false, "R + W = N — קריאה וכתיבה יכולות לא להיפגש");
  assert.equal(isStrong(5, 3, 3), true);
  assert.equal(isStrong(5, 2, 3), false);
});
test("quorumWrite — כותבת לכל מי שזמין, ומצליחה אם לפחות W אישרו", async () => {
  const { quorumWrite } = await get();
  const reps = fresh();
  reps[2].up = false;
  assert.equal(quorumWrite(reps, 2, "Haifa", 1), true);
  assert.deepEqual(reps.map((r) => [r.version, r.value]), [[1, "Haifa"], [1, "Haifa"], [0, null]], "העתק שלא זמין לא מתעדכן");
  reps[1].up = false;
  assert.equal(quorumWrite(reps, 2, "Eilat", 2), false, "רק העתק אחד זמין, W=2 — הכתיבה נכשלה");
  assert.equal(reps[0].version, 2, "גם כתיבה שנכשלה נשארת בהעתק שאישר (זה המחיר של quorum בלי טרנזקציה)");
});
test("quorumRead — R הזמינים הראשונים, הגרסה הגבוהה, ותיקון בקריאה", async () => {
  const { quorumRead } = await get();
  const reps = [
    { up: true, version: 1, value: "Haifa" },
    { up: false, version: 2, value: "Eilat" },
    { up: true, version: 3, value: "Akko" },
    { up: true, version: 0, value: null },
  ];
  const r = quorumRead(reps, 2);
  assert.deepEqual(r, { value: "Akko", version: 3, repaired: 1 }, "נקראו העתקים 0 ו־2 (1 לא זמין). הגבוה — 3");
  assert.deepEqual(reps.map((x) => x.version), [3, 2, 3, 0], "read repair רק למי שנקרא: העתק 0 עודכן, 3 לא נקרא");
  assert.equal(reps[0].value, "Akko");
  assert.deepEqual(quorumRead(reps, 2), { value: "Akko", version: 3, repaired: 0 }, "קריאה שנייה — אין מה לתקן");
});
test("אין מספיק העתקים ← Error; תרחיש: כתיבה עם W=2 וקריאה עם R=2 תמיד רואות זו את זו", async () => {
  const { quorumWrite, quorumRead } = await get();
  const reps = fresh();
  reps[0].up = false;
  reps[1].up = false;
  assert.throws(() => quorumRead(reps, 2), Error);
  for (let down = 0; down < 3; down++) {
    const reps2 = fresh();
    reps2[down].up = false;
    assert.equal(quorumWrite(reps2, 2, "v1", 1), true);
    for (const r of reps2) r.up = true;
    reps2[(down + 1) % 3].up = false;
    assert.equal(quorumRead(reps2, 2).value, "v1", `כתיבה בלי העתק ${down}, קריאה בלי העתק ${(down + 1) % 3}`);
  }
});
