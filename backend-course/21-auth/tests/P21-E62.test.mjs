import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E62.ts", ["createRefresher"])).createRefresher;

// doRefresh שאפשר לשלוט מתי הוא מסתיים
function controlled() {
  const calls = [];
  const doRefresh = () => new Promise((resolve, reject) => calls.push({ resolve, reject }));
  return { calls, doRefresh };
}

test("קריאות במקביל — refresh אחד", async () => {
  const createRefresher = await get();
  const { calls, doRefresh } = controlled();
  const refresh = createRefresher(doRefresh);
  const ps = [refresh(), refresh(), refresh(), refresh(), refresh()];
  assert.equal(calls.length, 1, "doRefresh נקרא פעם אחת");
  assert.ok(ps.every((p) => p === ps[0]), "כולם קיבלו את אותו Promise");
  calls[0].resolve("token-1");
  assert.deepEqual(await Promise.all(ps), ["token-1", "token-1", "token-1", "token-1", "token-1"]);
});
test("אחרי שהסתיים — refresh חדש", async () => {
  const createRefresher = await get();
  const { calls, doRefresh } = controlled();
  const refresh = createRefresher(doRefresh);
  const a = refresh();
  calls[0].resolve("t1");
  assert.equal(await a, "t1");
  const b = refresh();
  assert.equal(calls.length, 2, "אחרי שהראשון הסתיים, הקריאה הבאה מתחילה refresh חדש");
  calls[1].resolve("t2");
  assert.equal(await b, "t2");
});
test("כשל — כולם מקבלים את השגיאה, ואחר כך אפשר לנסות שוב", async () => {
  const createRefresher = await get();
  const { calls, doRefresh } = controlled();
  const refresh = createRefresher(doRefresh);
  const ps = [refresh(), refresh()];
  calls[0].reject(new Error("INVALID_REFRESH_TOKEN"));
  for (const p of ps) await assert.rejects(p, { message: "INVALID_REFRESH_TOKEN" });
  const c = refresh();
  assert.equal(calls.length, 2, "אחרי כשל — refresh חדש (לא אותה שגיאה לנצח)");
  calls[1].resolve("t3");
  assert.equal(await c, "t3");
});
test("שני refreshers נפרדים", async () => {
  const createRefresher = await get();
  const x = controlled();
  const y = controlled();
  const rx = createRefresher(x.doRefresh);
  const ry = createRefresher(y.doRefresh);
  rx();
  ry();
  assert.equal(x.calls.length + y.calls.length, 2, "לכל refresher מצב משלו (closure)");
});
