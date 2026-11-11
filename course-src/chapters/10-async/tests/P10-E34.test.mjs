import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E34.js", ["logInOrder"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("ההודעות מגיעות לפי הסדר, במרווחים", async () => {
  const { logInOrder } = await get();
  const got = [];
  const start = Date.now();
  logInOrder(["א", "ב", "ג"], 20, (m) => got.push({ m, ms: Date.now() - start }));
  assert.equal(got.length, 0, "שום הודעה לא נשלחת מיד — גם הראשונה בטיימר של 0");
  await sleep(90);
  assert.deepEqual(got.map((x) => x.m), ["א", "ב", "ג"]);
  assert.ok(got[1].ms >= 15, `השנייה הגיעה אחרי ${got[1].ms}ms — צריך gap אחד (20ms)`);
  assert.ok(got[2].ms >= 35, `השלישית הגיעה אחרי ${got[2].ms}ms — צריך 2 * gap (40ms)`);
  assert.ok(got[2].ms - got[0].ms >= 30, "ההודעות הגיעו כמעט יחד — לכל הודעה i המתנה של i * gap");
});
test("מערך ריק — כלום, והודעה אחת — בטיימר של 0", async () => {
  const { logInOrder } = await get();
  const got = [];
  logInOrder([], 10, (m) => got.push(m));
  logInOrder(["יחידה"], 10, (m) => got.push(m));
  assert.deepEqual(got, []);
  await sleep(20);
  assert.deepEqual(got, ["יחידה"]);
});
