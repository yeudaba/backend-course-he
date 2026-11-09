import { test } from "node:test";
import assert from "node:assert/strict";
import { loadP } from "./_events.mjs";
import { fakeClaude, message, toolUse } from "./_claude.mjs";

// פרויקט 4, שלב 5 (רשות): עוזר אנליטיקה
const { createAnalyticsAssistant } = await loadP(import.meta.url, "src/assistant.ts");

function fakeQuery(log) {
  return {
    daily: async (from, to, name) => (log.push(["daily", from, to, name ?? null]), { days: [{ day: from, events: 120, users: 40 }] }),
    funnel: async (steps, from, to) => (log.push(["funnel", steps, from, to]), { steps: steps.map((name, i) => ({ name, users: 100 >> i })) }),
  };
}

test("שאלה ← כלים ← תשובה; התאריך של היום (שעון ישראל) ב־system", async () => {
  const log = [];
  const { client, bodies } = fakeClaude((b, i) =>
    i === 0
      ? message([toolUse("daily_stats", { from: "2026-11-01", to: "2026-11-07" }, "d"), toolUse("funnel", { steps: ["page_view", "purchase"], from: "2026-11-01", to: "2026-11-07" }, "f")], { stop_reason: "tool_use" })
      : message("השבוע: 120 אירועים ביום הראשון, ו־50 מ־100 קנו."),
  );
  const a = createAnalyticsAssistant({ client, query: fakeQuery(log), now: () => new Date("2026-11-07T22:30:00Z") });
  const r = await a.ask("איך היה השבוע?");
  assert.equal(r.text, "השבוע: 120 אירועים ביום הראשון, ו־50 מ־100 קנו.");
  assert.deepEqual(log, [["daily", "2026-11-01", "2026-11-07", null], ["funnel", ["page_view", "purchase"], "2026-11-01", "2026-11-07"]]);
  assert.deepEqual(r.toolCalls.map((c) => c.name), ["daily_stats", "funnel"]);
  const b0 = bodies()[0];
  assert.match(b0.system, /2026-11-08/, "22:30 UTC ב־7.11 = 8.11 בישראל");
  assert.deepEqual(b0.tools.map((t) => t.name).sort(), ["daily_stats", "funnel"]);
  assert.equal(b0.model, "claude-opus-5-5");
  const results = bodies()[1].messages.at(-1).content;
  assert.equal(results.length, 2, "שתי תוצאות בהודעה אחת");
  assert.deepEqual(JSON.parse(results[0].content), { days: [{ day: "2026-11-01", events: 120, users: 40 }] });
});
test("שגיאה של ה־query ← is_error למודל; תקרת צעדים", async () => {
  const query = { daily: async () => { throw new Error("טווח של עד 92 ימים"); }, funnel: async () => ({}) };
  const { client, bodies } = fakeClaude((b, i) => (i === 0 ? message([toolUse("daily_stats", { from: "2025-01-01", to: "2026-11-01" })], { stop_reason: "tool_use" }) : message("הטווח ארוך מדי")));
  const r = await createAnalyticsAssistant({ client, query }).ask("כל הזמנים");
  assert.equal(r.text, "הטווח ארוך מדי");
  const res = bodies()[1].messages.at(-1).content[0];
  assert.equal(res.is_error, true);
  assert.match(res.content, /92/);
  const loop = fakeClaude(() => message([toolUse("daily_stats", { from: "2026-11-01", to: "2026-11-01" })], { stop_reason: "tool_use" }));
  const out = await createAnalyticsAssistant({ client: loop.client, query: fakeQuery([]), maxSteps: 3 }).ask("?");
  assert.equal(loop.requests.length, 3);
  assert.equal(typeof out.text, "string");
});
