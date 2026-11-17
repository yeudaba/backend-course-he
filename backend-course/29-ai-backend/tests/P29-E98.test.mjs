import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { searchDocs } = await load(import.meta.url, "P29-E98.ts");

async function setup(t) {
  const db = await sandbox(t, import.meta.url);
  await db.query(`CREATE TABLE docs (id int PRIMARY KEY, title text NOT NULL, body text NOT NULL, internal boolean NOT NULL DEFAULT false)`);
  await db.query(`INSERT INTO docs VALUES
    (1, 'אחריות', 'אחריות של שנתיים על כל מטחנה ומכונת אספרסו', false),
    (2, 'משלוחים', 'משלוח תוך 3 ימי עסקים. משלוח חינם מעל 200 ש״ח', false),
    (3, 'החזרות', 'אפשר להחזיר מטחנה תוך 30 יום עם קבלה', false),
    (4, 'Grinder FAQ', 'The C40 grinder is hand-made', false),
    (5, 'מחירי ספק: מטחנה', 'מטחנה אחריות עלות ספק 310', true),
    (6, 'נוהל החזרות פנימי', 'מטחנה אחריות החזרות חריגות', true),
    (7, 'מטחנה אחריות החזרות', 'פנימי', true),
    (8, 'בלוג', 'Isn''t it great? מטחנה', false)`);
  const queries = [];
  const spy = { query: (text, params) => (queries.push({ text, params }), db.client.query(text, params)) };
  return { spy, queries };
}

test("ציון לפי מילים, סדר, k", async (t) => {
  const { spy } = await setup(t);
  assert.deepEqual(await searchDocs(spy, "כמה זמן אחריות על מטחנה?", { role: "customer" }), [
    { id: 1, title: "אחריות", score: 2 },
    { id: 3, title: "החזרות", score: 1 },
    { id: 8, title: "בלוג", score: 1 },
  ]);
  assert.deepEqual(await searchDocs(spy, "משלוח חינם", { role: "customer", k: 5 }), [{ id: 2, title: "משלוחים", score: 2 }]);
  assert.deepEqual(await searchDocs(spy, "GRINDER c40", { role: "customer" }), [{ id: 4, title: "Grinder FAQ", score: 2 }], "בלי הבדל רישיות");
  assert.deepEqual(await searchDocs(spy, "מטחנה מטחנה מטחנה", { role: "customer", k: 1 }), [{ id: 1, title: "אחריות", score: 1 }], "מילה כפולה נספרת פעם אחת");
});
test("customer לא מקבל פנימיים — והסינון לפני ה־LIMIT", async (t) => {
  const { spy } = await setup(t);
  const c = await searchDocs(spy, "מטחנה אחריות החזרות", { role: "customer" });
  assert.deepEqual(c.map((d) => d.id), [1, 3, 8], "3 מסמכים ציבוריים, למרות ש־3 הכי רלוונטיים פנימיים");
  const s = await searchDocs(spy, "מטחנה אחריות החזרות", { role: "staff" });
  assert.deepEqual(s, [{ id: 6, title: "נוהל החזרות פנימי", score: 3 }, { id: 7, title: "מטחנה אחריות החזרות", score: 3 }, { id: 1, title: "אחריות", score: 2 }]);
});
test("בלי מילים ← בלי שאילתה; פרמטרים בלבד", async (t) => {
  const { spy, queries } = await setup(t);
  assert.deepEqual(await searchDocs(spy, "מה? לא, זה!", { role: "staff" }), []);
  assert.equal(queries.length, 0, "אין מילים באורך 3 ← לא פונים למסד");
  const evil = "isn't' OR 1=1 -- מטחנה";
  const r = await searchDocs(spy, evil, { role: "customer" });
  assert.ok(r.every((d) => [1, 3, 8].includes(d.id)), JSON.stringify(r));
  for (const q of queries) {
    assert.ok(!q.text.includes("isn") && !q.text.includes("מטחנה"), "הטקסט של השאלה לא בתוך ה־SQL");
    assert.ok(Array.isArray(q.params) && q.params.length > 0);
  }
});
