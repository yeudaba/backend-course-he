import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E33.js", ["sayLater"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("log נקראת אחרי הזמן, פעם אחת, עם הטקסט", async () => {
  const { sayLater } = await get();
  const calls = [];
  const start = Date.now();
  sayLater("שלום", 30, (t) => calls.push({ t, ms: Date.now() - start }));
  assert.equal(calls.length, 0, "log נקראה מיד — היא צריכה לחכות בתוך setTimeout");
  await sleep(80);
  assert.equal(calls.length, 1, `log נקראה ${calls.length} פעמים (צריך פעם אחת)`);
  assert.equal(calls[0].t, "שלום");
  assert.ok(calls[0].ms >= 25, `log נקראה אחרי ${calls[0].ms}ms — צריך לחכות 30ms`);
});
test("טקסט וזמן אחרים", async () => {
  const { sayLater } = await get();
  const calls = [];
  sayLater("ביי", 5, (t) => calls.push(t));
  sayLater("אחרון", 15, (t) => calls.push(t));
  await sleep(50);
  assert.deepEqual(calls, ["ביי", "אחרון"]);
});
