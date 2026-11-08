import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { buildMessages } = await load(import.meta.url, "P29-E07.ts");
const conv = (n) => Array.from({ length: n * 2 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", text: `${i % 2 ? "a" : "q"}${i >> 1}` }));

test("ההיסטוריה ואז השאלה החדשה", () => {
  assert.deepEqual(buildMessages(conv(1), "q-new"), [
    { role: "user", content: "q0" },
    { role: "assistant", content: "a0" },
    { role: "user", content: "q-new" },
  ]);
  assert.deepEqual(buildMessages([], "hi"), [{ role: "user", content: "hi" }]);
});
test("רק maxTurns הזוגות האחרונים", () => {
  const m = buildMessages(conv(10), "q-new", 2);
  assert.deepEqual(m.map((x) => x.content), ["q8", "a8", "q9", "a9", "q-new"]);
});
test("מתחיל ב־user; שאלה אחרונה בלי תשובה וטקסט ריק — לא נשלחים", () => {
  const h = [{ role: "assistant", text: "ברוך הבא" }, { role: "user", text: "q1" }, { role: "assistant", text: "  " }, { role: "assistant", text: "a1" }, { role: "user", text: "q2-failed" }];
  assert.deepEqual(buildMessages(h, "q3").map((x) => [x.role, x.content]), [["user", "q1"], ["assistant", "a1"], ["user", "q3"]]);
});
