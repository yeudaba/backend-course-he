import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P10-E83.js", ["scheduleReminders"])).scheduleReminders;

function record(fn, messages, gap) {
  return new Promise((resolve) => {
    const calls = [];
    let returned = false;
    const start = Date.now();
    fn(messages, gap, (m) => calls.push({ m, sync: !returned, ms: Date.now() - start }));
    returned = true;
    setTimeout(() => resolve(calls), (messages.length + 1) * gap + 150);
  });
}

test("ההודעות בסדר, ו'סיימנו' בסוף", async () => {
  const calls = await record(await get(), ["א", "ב", "ג"], 40);
  assert.deepEqual(calls.map((c) => c.m), ["א", "ב", "ג", "סיימנו"]);
});
test("אף קריאה ל־log לא קורית לפני שהפונקציה חוזרת", async () => {
  const calls = await record(await get(), ["א", "ב"], 30);
  assert.deepEqual(calls.filter((c) => c.sync).map((c) => c.m), [], "log נקראה מיד — setTimeout צריך לקבל פונקציה, לא את התוצאה שלה");
});
test("מרווחים: הודעה i אחרי i × gap, 'סיימנו' מרווח אחרי האחרונה", async () => {
  const gap = 60;
  const calls = await record(await get(), ["א", "ב", "ג"], gap);
  const at = Object.fromEntries(calls.map((c) => [c.m, c.ms]));
  assert.ok(at["ב"] >= gap - 5, `ההודעה השנייה הגיעה אחרי ${at["ב"]}ms — צריך בערך ${gap}`);
  assert.ok(at["ג"] >= 2 * gap - 5, `ההודעה השלישית הגיעה אחרי ${at["ג"]}ms — צריך בערך ${2 * gap}`);
  assert.ok(at["סיימנו"] >= 3 * gap - 5, `'סיימנו' הגיע אחרי ${at["סיימנו"]}ms — צריך מרווח אחרי האחרונה (${3 * gap})`);
});
test("רשימה ריקה — רק 'סיימנו'", async () => {
  const calls = await record(await get(), [], 20);
  assert.deepEqual(calls.map((c) => c.m), ["סיימנו"]);
});
