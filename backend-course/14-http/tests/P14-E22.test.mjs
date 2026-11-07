import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { createCounterServer } = await load(import.meta.url, "P14-E22.mjs");

test("השרת", async (t) => {
  const { base, close } = await listen(createCounterServer());
  t.after(close);
  const post = (raw) => fetch(base + "/count", { method: "POST", body: raw, signal: AbortSignal.timeout(1000) });

  await t.test("JSON שבור → 400, והשרת ממשיך לעבוד", async () => {
    const res = await post("{oops");
    assert.equal(res.status, 400);
    assert.equal((await post(JSON.stringify({ word: "x" }))).status, 200);
  });
  await t.test("word לא תקין → 400", async () => {
    for (const body of [{}, { word: "" }, { word: 5 }]) assert.equal((await post(JSON.stringify(body))).status, 400, JSON.stringify(body));
  });
  await t.test("ספירה", async () => {
    assert.deepEqual(await (await post(JSON.stringify({ word: "שלום" }))).json(), { word: "שלום", count: 1 });
    assert.deepEqual(await (await post(JSON.stringify({ word: "שלום" }))).json(), { word: "שלום", count: 2 });
  });
  await t.test("GET עם מילה בעברית", async () => {
    const res = await fetch(base + "/count/שלום", { signal: AbortSignal.timeout(1000) });
    assert.deepEqual(await res.json(), { word: "שלום", count: 2 });
    assert.deepEqual(await (await fetch(base + "/count/אחר")).json(), { word: "אחר", count: 0 });
  });
});
