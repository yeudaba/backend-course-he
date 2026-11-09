import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createLimiter } = await load(import.meta.url, "P29.5-E18.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function measure(limiter, name, n, ms = 30) {
  let now = 0;
  let peak = 0;
  const results = await Promise.all(
    Array.from({ length: n }, (_, i) =>
      limiter.run(name, async () => {
        peak = Math.max(peak, ++now);
        await sleep(ms);
        now--;
        return i;
      }),
    ),
  );
  return { peak, results };
}

test("לכל כלי — התקרה שלו", async () => {
  const l = createLimiter({ query_db: 2, send_email: 1 });
  const [db, mail, other] = await Promise.all([measure(l, "query_db", 8), measure(l, "send_email", 3), measure(l, "search", 9)]);
  assert.equal(db.peak, 2);
  assert.equal(mail.peak, 1);
  assert.equal(other.peak, 4, "ברירת מחדל 4");
  assert.deepEqual(db.results, [0, 1, 2, 3, 4, 5, 6, 7], "כל קריאה מחזירה את התוצאה שלה");
});
test("שגיאה משחררת את המקום", async () => {
  const l = createLimiter({ x: 1 });
  await assert.rejects(l.run("x", async () => { throw new Error("boom"); }), /boom/);
  assert.equal(await l.run("x", async () => "ok"), "ok");
  assert.equal(l.active("x"), 0);
});
test("FIFO: מי שחיכה ראשון — נכנס ראשון", async () => {
  const l = createLimiter({ x: 1 });
  const order = [];
  await Promise.all([1, 2, 3, 4].map((i) => l.run("x", async () => { order.push(i); await sleep(5); })));
  assert.deepEqual(order, [1, 2, 3, 4]);
});
