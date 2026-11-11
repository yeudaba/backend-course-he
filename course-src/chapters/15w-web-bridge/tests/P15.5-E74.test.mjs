import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E74.mjs", ["latestOnly"])).latestOnly;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
test("ישנה מסומנת stale", async () => {
  const latestOnly = await get();
  const calls = [];
  const load = latestOnly(async (s, ms) => {
    calls.push(s);
    await sleep(ms);
    return s.toUpperCase();
  });
  const a = load("open", 80);
  const b = load("done", 10);
  assert.deepEqual(await b, { stale: false, value: "DONE" });
  assert.deepEqual(await a, { stale: true });
  assert.deepEqual(calls, ["open", "done"], "fn נקראת בכל קריאה, עם הארגומנטים");
  assert.deepEqual(await load("x", 1), { stale: false, value: "X" });
});
test("בסדר רגיל — שתיהן עדכניות כשלא חופפות", async () => {
  const latestOnly = await get();
  const load = latestOnly(async (v) => v);
  assert.deepEqual(await load(1), { stale: false, value: 1 });
  assert.deepEqual(await load(2), { stale: false, value: 2 });
  const p1 = load(3);
  const p2 = load(4);
  assert.deepEqual(await p1, { stale: true }, "גם כשהישנה חוזרת קודם — כבר התחילה חדשה");
  assert.deepEqual(await p2, { stale: false, value: 4 });
});
test("שגיאות", async () => {
  const latestOnly = await get();
  const load = latestOnly(async (fail, ms) => {
    await sleep(ms);
    if (fail) throw new Error("רשת");
    return "ok";
  });
  await assert.rejects(load(true, 1), { message: "רשת" }, "שגיאה בקריאה העדכנית — נזרקת");
  const old = load(true, 50);
  const fresh = load(false, 5);
  assert.deepEqual(await fresh, { stale: false, value: "ok" });
  assert.deepEqual(await old, { stale: true }, "שגיאה בקריאה ישנה ← stale");
});
test("מונה נפרד לכל latestOnly", async () => {
  const latestOnly = await get();
  const a = latestOnly(async (v) => (await sleep(20), v));
  const b = latestOnly(async (v) => v);
  const pa = a("a");
  await b("b");
  assert.deepEqual(await pa, { stale: false, value: "a" });
});
