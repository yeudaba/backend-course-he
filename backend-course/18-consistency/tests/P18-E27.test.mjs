import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck, code } from "./_ts.mjs";
import { countingPool, withTimeout } from "./_helpers.mjs";

const FILE = "P18-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["createPersonLoader"])).createPersonLoader;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("30 קריאות באותו סיבוב ← שאילתה אחת", async (t) => {
  const createPersonLoader = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const { pool, counter } = countingPool(db.pool(3));
  const load = createPersonLoader(pool);
  const ids = [7, 3, 7, 19999, 25000, ...Array.from({ length: 25 }, (_, i) => 100 + i)];
  const people = await withTimeout(Promise.all(ids.map((id) => load(id))), 3000, "load לא החזירה תשובה — האם flush נקראת וקוראת ל־resolve?");
  assert.equal(counter.n, 1, `נשלחו ${counter.n} שאילתות — כל הקריאות באותו סיבוב צריכות להתאחד לאחת`);
  assert.deepEqual(people[0], { id: 7, full_name: "Customer #7" });
  assert.deepEqual(people[1], { id: 3, full_name: "Customer #3" });
  assert.deepEqual(people[2], { id: 7, full_name: "Customer #7" }, "אותו id פעמיים — שני הקוראים מקבלים את האדם");
  assert.deepEqual(people[3], { id: 19999, full_name: "Customer #19999" });
  assert.equal(people[4], null, "id שלא קיים ← null");
  assert.deepEqual(people.slice(5).map((p) => p.id), ids.slice(5), "כל קורא מקבל את האדם שלו");
});
test("ids כפולים נשלחים פעם אחת", async () => {
  const createPersonLoader = await get();
  const sent = [];
  const fake = { query: async (text, values) => { sent.push(values[0]); return { rows: values[0].map((id) => ({ id, full_name: `P${id}` })) }; } };
  const load = createPersonLoader(fake);
  await withTimeout(Promise.all([load(5), load(5), load(6), load(5)]), 3000, "load לא החזירה תשובה");
  assert.equal(sent.length, 1);
  assert.deepEqual([...sent[0]].sort(), [5, 6], "המערך בשאילתה צריך להכיל כל id פעם אחת");
});
test("סיבובים נפרדים ← שאילתות נפרדות", async (t) => {
  const createPersonLoader = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const { pool, counter } = countingPool(db.pool(3));
  const load = createPersonLoader(pool);
  assert.equal((await load(1)).full_name, "Customer #1");
  assert.equal((await load(2)).full_name, "Customer #2");
  const [a, b] = await Promise.all([load(3), load(4)]);
  assert.deepEqual([a.id, b.id], [3, 4]);
  assert.equal(counter.n, 3, `נשלחו ${counter.n} שאילתות — שני סיבובים בודדים ועוד סיבוב של שתיים = 3`);
});
test("קריאות שמגיעות בזמן שהשאילתה רצה — לא הולכות לאיבוד", async () => {
  const createPersonLoader = await get();
  let release;
  const calls = [];
  const fake = {
    query: async (text, values) => {
      calls.push(values[0]);
      if (calls.length === 1) await new Promise((r) => (release = r));
      return { rows: values[0].map((id) => ({ id, full_name: `P${id}` })) };
    },
  };
  const load = createPersonLoader(fake);
  const first = load(1);
  await new Promise((r) => setTimeout(r, 20)); // השאילתה הראשונה יצאה ומחכה
  const second = load(2);
  release();
  const [a, b] = await withTimeout(Promise.all([first, second]), 3000, "קריאה שהגיעה בזמן שהשאילתה רצה לא קיבלה תשובה — החלף את ה־Map לפני ה־await");
  assert.equal(a.id, 1);
  assert.equal(b.id, 2);
  assert.equal(calls.length, 2);
});
test("שאילתה שנכשלה ← כולם נדחים", async () => {
  const createPersonLoader = await get();
  const boom = new Error("המסד נפל");
  const load = createPersonLoader({ query: async () => { throw boom; } });
  const results = await withTimeout(Promise.allSettled([load(1), load(2), load(1)]), 3000, "כשהשאילתה נכשלת צריך לקרוא ל־reject לכל הממתינים");
  assert.deepEqual(results.map((r) => r.status), ["rejected", "rejected", "rejected"]);
  assert.ok(results.every((r) => r.reason === boom), "כולם נדחים עם אותה שגיאה");
});
test("שאילתה עם ANY", () => {
  assert.match(code(import.meta.url, FILE), /ANY\s*\(\s*\$1\s*\)/i, "השתמש ב־WHERE id = ANY($1) עם מערך ה־ids");
});
