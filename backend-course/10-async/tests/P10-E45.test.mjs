import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E45.js", ["lazyCounter"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("add לא משנה מיד; אחרי ms — כן", async () => {
  const { lazyCounter } = await get();
  const c = lazyCounter(20);
  assert.equal(c.get(), 0);
  c.add(5);
  c.add(2);
  assert.equal(c.get(), 0, "get() מיד אחרי add() צריכה להחזיר את הערך הישן — ההוספה בטיימר");
  await sleep(8);
  assert.equal(c.get(), 0, "ההוספה קרתה לפני ms");
  await sleep(35);
  assert.equal(c.get(), 7);
});
test("שני מונים לא מתערבבים", async () => {
  const { lazyCounter } = await get();
  const a = lazyCounter(5);
  const b = lazyCounter(5);
  a.add(10);
  b.add(1);
  b.add(1);
  await sleep(25);
  assert.equal(a.get(), 10, "count צריך להיות בתוך lazyCounter — לכל מונה משלו");
  assert.equal(b.get(), 2);
});
