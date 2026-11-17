import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { evalCasesFromLogs } = await load(import.meta.url, "P29-E99.ts");
const L = (o) => JSON.stringify({ level: 30, time: 1, ...o });

test("רק ai_answer עם feedback bad, עם redaction", () => {
  const lines = [
    L({ msg: "request completed", reqId: "r-1" }),
    L({ msg: "ai_answer", reqId: "r-2", question: "איפה ההזמנה? המייל שלי dana.k+shop@mail.co.il", answer: "נשלחה", feedback: "good" }),
    L({ msg: "ai_answer", reqId: "r-3", question: "תתקשרו אליי 054-123 4567 לגבי החזר", answer: "התקשרתי ל־0541234567", feedback: "bad" }),
    "",
    "not json at all",
    "42",
    "null",
    L({ msg: "ai_answer", question: "כתבתי ל־a@b.com ולא ענו", answer: "a@b.com לא קיים", feedback: "bad" }),
  ];
  assert.deepEqual(evalCasesFromLogs(lines), [
    { name: "r-3", input: "תתקשרו אליי [PHONE] לגבי החזר", badAnswer: "התקשרתי ל־[PHONE]" },
    { name: "line-8", input: "כתבתי ל־[EMAIL] ולא ענו", badAnswer: "[EMAIL] לא קיים" },
  ]);
});
test("כפילויות אחרי redaction ונרמול — נשארת הראשונה", () => {
  const lines = [
    L({ msg: "ai_answer", reqId: "a", question: "מה  מדיניות ההחזרות? x@y.com", answer: "1", feedback: "bad" }),
    L({ msg: "ai_answer", reqId: "b", question: "  מה מדיניות   ההחזרות? other@z.org ", answer: "2", feedback: "bad" }),
    L({ msg: "ai_answer", reqId: "c", question: "מה מדיניות המשלוחים?", answer: "3", feedback: "bad" }),
    L({ msg: "ai_answer", reqId: "d", question: "Refund?", answer: "4", feedback: "bad" }),
    L({ msg: "ai_answer", reqId: "e", question: "REFUND?", answer: "5", feedback: "bad" }),
  ];
  assert.deepEqual(evalCasesFromLogs(lines).map((c) => [c.name, c.input]), [
    ["a", "מה  מדיניות ההחזרות? [EMAIL]"],
    ["c", "מה מדיניות המשלוחים?"],
    ["d", "Refund?"],
  ]);
  assert.deepEqual(evalCasesFromLogs([]), []);
});
