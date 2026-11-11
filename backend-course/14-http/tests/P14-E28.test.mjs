import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P14-E28.mjs";
const get = async () => (await exportsOf(import.meta.url, FILE, ["waitUntilReady"])).waitUntilReady;

// שרת שעונה failFirst פעמים עם 503, ואחר כך 200. מחזיר את הכתובת, מונה בקשות וסגירה
async function flaky(failFirst) {
  const state = { calls: 0 };
  const server = http.createServer((req, res) => {
    state.calls++;
    res.writeHead(state.calls <= failFirst ? 503 : 200).end();
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  state.url = `http://127.0.0.1:${server.address().port}/health`;
  state.close = () => new Promise((r) => server.close(r));
  return state;
}

// פורט שאף אחד לא מקשיב עליו
async function deadUrl() {
  const s = await flaky(0);
  await s.close();
  return s.url;
}

test("השרת מוכן מיד ← 1", async () => {
  const waitUntilReady = await get();
  const s = await flaky(0);
  try {
    assert.equal(await waitUntilReady(s.url, { delayMs: 10 }), 1);
    assert.equal(s.calls, 1);
  } finally {
    await s.close();
  }
});
test("503 פעמיים ← מוכן בניסיון 3, עם המתנה בין ניסיונות", async () => {
  const waitUntilReady = await get();
  const s = await flaky(2);
  try {
    const start = Date.now();
    assert.equal(await waitUntilReady(s.url, { delayMs: 40 }), 3);
    const ms = Date.now() - start;
    assert.ok(ms >= 70, `עברו רק ${ms}ms — בין ניסיון לניסיון מחכים delayMs (40ms × 2)`);
    assert.equal(s.calls, 3);
  } finally {
    await s.close();
  }
});
test("לא מוכן אף פעם ← שגיאה אחרי tries ניסיונות, בלי המתנה אחרי האחרון", async () => {
  const waitUntilReady = await get();
  const s = await flaky(1000);
  try {
    const start = Date.now();
    await assert.rejects(waitUntilReady(s.url, { tries: 3, delayMs: 100 }), { message: "השרת לא מוכן אחרי 3 ניסיונות" });
    const ms = Date.now() - start;
    assert.equal(s.calls, 3, `נשלחו ${s.calls} בקשות — עם tries: 3 שולחים בדיוק 3`);
    assert.ok(ms < 290, `לקח ${ms}ms — אחרי הניסיון האחרון לא מחכים (שתי המתנות של 100ms, לא שלוש)`);
  } finally {
    await s.close();
  }
});
test("השרת לא מקשיב (fetch נכשל) ← ממשיכים לנסות", async () => {
  const waitUntilReady = await get();
  const url = await deadUrl();
  await assert.rejects(waitUntilReady(url, { tries: 2, delayMs: 10 }), { message: "השרת לא מוכן אחרי 2 ניסיונות" }, "fetch זורק כשהשרת לא מקשיב — תפוס את השגיאה (try/catch) ונסה שוב");
});
test("ברירות מחדל: tries = 10", async () => {
  const waitUntilReady = await get();
  const s = await flaky(9);
  try {
    assert.equal(await waitUntilReady(s.url, { delayMs: 1 }), 10);
  } finally {
    await s.close();
  }
  const url = await deadUrl();
  await assert.rejects(waitUntilReady(url, { delayMs: 1 }), { message: "השרת לא מוכן אחרי 10 ניסיונות" });
});
test("לולאת while", () => {
  assert.match(code(import.meta.url, FILE), /\bwhile\s*\(/, "התרגיל מתרגל while (פרק 4): לא יודעים מראש כמה ניסיונות יידרשו");
});
