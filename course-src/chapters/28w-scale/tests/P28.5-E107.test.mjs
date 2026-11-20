import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const FILE = "P28.5-E107.ts";

function fakeApi(pages) {
  const calls = [];
  const fetchPage = async (n) => {
    calls.push(n);
    await new Promise((r) => setTimeout(r, 2));
    return pages[n];
  };
  return { fetchPage, calls };
}

const PAGES = {
  1: { items: [{ id: "o1", paid: true }, { id: "o2", paid: false }, { id: "o3", paid: true }], next: 2 },
  2: { items: [{ id: "o4", paid: false }], next: 3 },
  3: { items: [{ id: "o5", paid: true }], next: null },
};

test("TypeScript: הקובץ עובר קומפילציה", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, `שגיאות TypeScript (שתיים מהן בסעיף "טעויות נפוצות" בשיעור):\n${r.output}`);
});

test("paidOrders: רק ששולמו, מכל העמודים", async () => {
  const { paidOrders } = await load(import.meta.url, FILE);
  const api = fakeApi(PAGES);
  const out = [];
  for await (const o of paidOrders(api.fetchPage)) out.push(o.id);
  assert.deepEqual(out, ["o1", "o3", "o5"]);
  assert.deepEqual(api.calls, [1, 2, 3]);
});

test("paidReport: count ו־ids נכונים", async () => {
  const { paidReport } = await load(import.meta.url, FILE);
  const api = fakeApi(PAGES);
  const r = await paidReport(api.fetchPage);
  assert.deepEqual(r.ids, ["o1", "o3", "o5"], "ids ריק? עוברים פעמיים על אותו generator — בפעם השנייה הוא כבר גמר");
  assert.equal(r.count, 3);
  const none = fakeApi({ 1: { items: [{ id: "x", paid: false }], next: null } });
  assert.deepEqual(await paidReport(none.fetchPage), { count: 0, ids: [] });
});

test("paidReport: כל עמוד נטען פעם אחת", async () => {
  const { paidReport } = await load(import.meta.url, FILE);
  const api = fakeApi(PAGES);
  await paidReport(api.fetchPage);
  assert.deepEqual(api.calls, [1, 2, 3], `כל עמוד צריך להיטען פעם אחת בלבד, נטענו: ${api.calls} — שני generators = שתי סריקות של ה־API`);
});
