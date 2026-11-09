import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking } from "./_claude.mjs";

const { runSimpleAgent } = await load(import.meta.url, "P29.5-E20.ts");
const def = (name) => ({ name, description: name, input_schema: { type: "object", properties: {} } });
const tools = {
  a: { definition: def("a"), run: async () => "A" },
  b: { definition: def("b"), run: async () => "B" },
  fail: { definition: def("fail"), run: async () => { throw new Error("db down"); } },
};

test("באג 1: כל התוצאות של תור אחד — בהודעת user אחת", async () => {
  const { client, bodies } = fakeClaude((b, i) => (i === 0 ? message([toolUse("a", {}, "t1"), toolUse("b", {}, "t2")], { stop_reason: "tool_use" }) : message("ok")));
  await runSimpleAgent(client, { system: "s", tools, prompt: "go" });
  const msgs = bodies()[1].messages;
  assert.equal(msgs.length, 3, `${msgs.length} הודעות — תוצאות בהודעות נפרדות מלמדות את המודל להפסיק לקרוא לכלים במקביל`);
  assert.deepEqual(msgs[2].content.map((r) => r.tool_use_id), ["t1", "t2"]);
});
test("באג 2: כלי שנכשל ← is_error, והסוכן ממשיך", async () => {
  const { client, bodies } = fakeClaude((b, i) => (i === 0 ? message([toolUse("fail", {}, "f1")], { stop_reason: "tool_use" }) : message("לא הצלחתי לבדוק")));
  assert.equal(await runSimpleAgent(client, { system: "s", tools, prompt: "go" }), "לא הצלחתי לבדוק");
  const r = bodies()[1].messages.at(-1).content[0];
  assert.deepEqual([r.tool_use_id, r.is_error], ["f1", true]);
  assert.match(r.content, /db down/);
});
test("באג 3: ה־assistant חוזר עם כל הבלוקים — tool_use ו־thinking", async () => {
  const { client, bodies } = fakeClaude((b, i) => (i === 0 ? message([thinking(), { type: "text", text: "בודק…" }, toolUse("a", {}, "t1")], { stop_reason: "tool_use" }) : message("ok")));
  await runSimpleAgent(client, { system: "s", tools, prompt: "go" });
  const asst = bodies()[1].messages[1];
  assert.equal(asst.role, "assistant");
  assert.ok(Array.isArray(asst.content), "content כמערך בלוקים, לא מחרוזת");
  assert.deepEqual(asst.content.map((b) => b.type), ["thinking", "text", "tool_use"]);
});
