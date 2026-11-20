import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { paginate, findFirst } = await load(import.meta.url, "P28.5-E106.ts");

// API מדומה: מחזיר עמודים לפי מספר, ורושם כל קריאה
function fakeApi(pages) {
  const calls = [];
  const fetchPage = async (n) => {
    calls.push(n);
    await new Promise((r) => setTimeout(r, 2));
    if (!pages[n]) throw new Error(`אין עמוד ${n} — האם ממשיכים לפי next?`);
    return pages[n];
  };
  return { fetchPage, calls };
}

const PAGES = {
  1: { items: ["a1", "a2"], next: 2 },
  2: { items: ["b1", "b2"], next: 3 },
  3: { items: ["c1"], next: null },
};

async function collect(gen) {
  const out = [];
  for await (const x of gen) out.push(x);
  return out;
}

test("paginate: כל הפריטים, לפי הסדר", async () => {
  assert.equal(typeof paginate, "function", "צריך לייצא paginate");
  const api = fakeApi(PAGES);
  const g = paginate(api.fetchPage);
  assert.equal(typeof g[Symbol.asyncIterator], "function", "paginate צריך להחזיר async generator (async function*)");
  assert.deepEqual(await collect(g), ["a1", "a2", "b1", "b2", "c1"]);
  assert.deepEqual(api.calls, [1, 2, 3], "כל עמוד פעם אחת, מ־1 ולפי next");
});

test("paginate: עצל — עמוד נטען רק כשצריך אותו", async () => {
  const api = fakeApi(PAGES);
  const g = paginate(api.fetchPage);
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(api.calls, [], "paginate(...) לבד לא אמור לקרוא ל־API");
  assert.equal((await g.next()).value, "a1");
  assert.equal((await g.next()).value, "a2");
  assert.deepEqual(api.calls, [1], "אחרי שני הפריטים של עמוד 1 — רק עמוד 1 נטען");
  assert.equal((await g.next()).value, "b1");
  assert.deepEqual(api.calls, [1, 2]);
});

test("paginate: next לא רציף, ועמוד ריק באמצע", async () => {
  const api = fakeApi({
    1: { items: ["x"], next: 7 },
    7: { items: [], next: 4 },
    4: { items: ["y", "z"], next: null },
  });
  assert.deepEqual(await collect(paginate(api.fetchPage)), ["x", "y", "z"], "עמוד ריק הוא לא הסוף — רק next: null");
  assert.deepEqual(api.calls, [1, 7, 4], "ממשיכים לפי next, לא page++");
  const empty = fakeApi({ 1: { items: [], next: null } });
  assert.deepEqual(await collect(paginate(empty.fetchPage)), []);
});

test("findFirst: עוצר ברגע שנמצא", async () => {
  assert.equal(typeof findFirst, "function", "צריך לייצא findFirst");
  const api = fakeApi(PAGES);
  assert.equal(await findFirst(api.fetchPage, (x) => x.startsWith("b")), "b1");
  assert.deepEqual(api.calls, [1, 2], `נמצא בעמוד 2 — עמוד 3 לא אמור להיטען (נטענו: ${api.calls})`);
  const first = fakeApi(PAGES);
  assert.equal(await findFirst(first.fetchPage, (x) => x === "a1"), "a1");
  assert.deepEqual(first.calls, [1], "נמצא בעמוד הראשון — רק עמוד 1");
});

test("findFirst: לא נמצא ← undefined", async () => {
  const api = fakeApi(PAGES);
  assert.equal(await findFirst(api.fetchPage, (x) => x === "zz"), undefined);
  assert.deepEqual(api.calls, [1, 2, 3], "כשלא נמצא — עוברים על כל העמודים");
  const objs = fakeApi({ 1: { items: [{ id: 1, total: 50 }], next: 2 }, 2: { items: [{ id: 2, total: 900 }], next: null } });
  assert.deepEqual(await findFirst(objs.fetchPage, (o) => o.total > 100), { id: 2, total: 900 }, "גם על אובייקטים");
});
