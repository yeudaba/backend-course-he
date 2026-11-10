import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E28.js", ["fetchAll"]);

// API מדומה: total פריטים, size בכל עמוד. סופר כמה בקשות יצאו
function fakeApi(total, size) {
  const calls = [];
  const getPage = async (n) => {
    calls.push(n);
    await new Promise((r) => setTimeout(r, 2));
    const items = [];
    for (let i = (n - 1) * size; i < Math.min(n * size, total); i++) items.push(`item-${i}`);
    return { items, next: n * size < total ? n + 1 : null };
  };
  return { getPage, calls };
}

test("שני עמודים", async () => {
  const { fetchAll } = await get();
  const pages = { 1: { items: ["a", "b"], next: 2 }, 2: { items: ["c"], next: null } };
  assert.deepEqual(await fetchAll(async (n) => pages[n]), ["a", "b", "c"]);
});
test("23 פריטים, 5 בעמוד — 5 בקשות, לפי הסדר", async () => {
  const { fetchAll } = await get();
  const { getPage, calls } = fakeApi(23, 5);
  const all = await fetchAll(getPage);
  assert.equal(all.length, 23, "מספר הפריטים (push(...items) ולא push(items)?)");
  assert.equal(all[0], "item-0");
  assert.equal(all[22], "item-22");
  assert.deepEqual(calls, [1, 2, 3, 4, 5], "העמודים שהתבקשו");
});
test("עמוד אחד ריק", async () => {
  const { fetchAll } = await get();
  assert.deepEqual(await fetchAll(async () => ({ items: [], next: null })), []);
});
test("API שלא נגמר — נעצרים אחרי maxPages", async () => {
  const { fetchAll } = await get();
  const calls = [];
  const endless = async (n) => {
    calls.push(n);
    return { items: [n], next: n + 1 };
  };
  await assert.rejects(fetchAll(endless, 3), { message: "יותר מדי עמודים" });
  assert.equal(calls.length, 3, `יצאו ${calls.length} בקשות — עם maxPages = 3 מותר בדיוק 3`);
});
test("ברירת המחדל של maxPages היא 100", async () => {
  const { fetchAll } = await get();
  const { getPage } = fakeApi(100, 1);
  assert.equal((await fetchAll(getPage)).length, 100, "100 עמודים בדיוק — מותר");
  await assert.rejects(fetchAll(fakeApi(101, 1).getPage), { message: "יותר מדי עמודים" });
});
test("לולאת while", () => {
  assert.match(code(import.meta.url, "P10-E28.js"), /\bwhile\s*\(/, "התרגיל מתרגל while (פרק 4): לא יודעים מראש כמה עמודים יהיו");
});
