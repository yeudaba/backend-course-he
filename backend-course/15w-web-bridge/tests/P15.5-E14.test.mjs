import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E14.mjs", ["debounce"])).debounce;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("רצף קריאות ← קריאה אחת, עם הארגומנטים האחרונים", async () => {
  const debounce = await get();
  const calls = [];
  const d = debounce((...args) => calls.push(args), 60);
  assert.equal(typeof d, "function", "debounce צריכה להחזיר פונקציה");
  d("c");
  await sleep(20);
  d("co");
  await sleep(20);
  d("cor", 2);
  assert.deepEqual(calls, [], "fn לא רצה מיד — מחכים ms בלי קריאה נוספת");
  await sleep(30);
  assert.deepEqual(calls, [], "עברו רק 30ms מהקריאה האחרונה — כל קריאה מאפסת את הטיימר");
  await sleep(60);
  assert.deepEqual(calls, [["cor", 2]], "קריאה אחת, עם כל הארגומנטים של הקריאה האחרונה");
});
test("שני רצפים נפרדים ← שתי קריאות", async () => {
  const debounce = await get();
  const calls = [];
  const d = debounce((q) => calls.push(q), 30);
  d("a");
  await sleep(70);
  d("b");
  d("bb");
  await sleep(70);
  assert.deepEqual(calls, ["a", "bb"]);
});
test("cancel מבטל קריאה שממתינה", async () => {
  const debounce = await get();
  const calls = [];
  const d = debounce((q) => calls.push(q), 30);
  assert.equal(typeof d.cancel, "function", "לפונקציה המוחזרת צריכה להיות מתודה cancel");
  d("x");
  d.cancel();
  await sleep(70);
  assert.deepEqual(calls, [], "אחרי cancel, fn לא רצה");
  d("y");
  await sleep(70);
  assert.deepEqual(calls, ["y"], "אחרי cancel אפשר להמשיך להשתמש בפונקציה");
});
test("לכל debounce טיימר משלו", async () => {
  const debounce = await get();
  const calls = [];
  const a = debounce((q) => calls.push(`a:${q}`), 30);
  const b = debounce((q) => calls.push(`b:${q}`), 30);
  a(1);
  b(2);
  await sleep(70);
  assert.deepEqual(calls.sort(), ["a:1", "b:2"], "הקריאה ל־b ביטלה את a — הטיימר צריך להיות בתוך debounce (closure), לא ברמת הקובץ");
});
