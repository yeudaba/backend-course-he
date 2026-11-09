import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse } from "./_claude.mjs";

const { runAgent } = await load(import.meta.url, "P29.5-E06.ts");
const def = (name) => ({ name, description: name, input_schema: { type: "object", properties: {} } });

test("כלים במקביל, ותוצאות בהודעה אחת — באותו סדר", async () => {
  const started = [];
  let inFlight = 0;
  let peak = 0;
  const slow = (name, ms) => ({
    definition: def(name),
    run: async () => {
      started.push(name);
      peak = Math.max(peak, ++inFlight);
      await new Promise((r) => setTimeout(r, ms));
      inFlight--;
      return `${name} ok`;
    },
  });
  const { client, bodies } = fakeClaude((body, i) =>
    i === 0 ? message([toolUse("a", {}, "t1"), toolUse("b", {}, "t2"), toolUse("c", {}, "t3")], { stop_reason: "tool_use" }) : message("הכול מוכן"),
  );
  const r = await runAgent(client, { system: "s", tools: { a: slow("a", 60), b: slow("b", 10), c: slow("c", 30) }, prompt: "go" });
  assert.equal(r.status, "done");
  assert.equal(r.text, "הכול מוכן");
  assert.equal(peak, 3, "שלושת הכלים רצו במקביל");
  const last = bodies()[1].messages.at(-1);
  assert.equal(last.role, "user");
  assert.deepEqual(last.content.map((b) => [b.type, b.tool_use_id, b.content]), [["tool_result", "t1", "a ok"], ["tool_result", "t2", "b ok"], ["tool_result", "t3", "c ok"]]);
  assert.equal(bodies()[1].messages.at(-2).content.length, 3, "ה־assistant נשמר עם כל בלוקי ה־tool_use");
});
test("כלי שזורק, וכלי שלא קיים ← is_error, והסוכן ממשיך", async () => {
  const { client, bodies } = fakeClaude((body, i) => (i === 0 ? message([toolUse("boom", {}, "x1"), toolUse("nope", {}, "x2")], { stop_reason: "tool_use" }) : message("סליחה, תקלה")));
  const r = await runAgent(client, { system: "s", tools: { boom: { definition: def("boom"), run: async () => { throw new Error("db down"); } } }, prompt: "go" });
  assert.equal(r.status, "done");
  const res = bodies()[1].messages.at(-1).content;
  assert.equal(res[0].is_error, true);
  assert.match(res[0].content, /db down/);
  assert.equal(res[1].is_error, true);
  assert.match(res[1].content, /nope/);
});
test("תקרת צעדים, refusal ו־max_tokens — סטטוס ברור, וספירת טוקנים", async () => {
  const loop = fakeClaude(() => message([toolUse("a", {})], { stop_reason: "tool_use", usage: { input_tokens: 50, output_tokens: 5 } }));
  const r = await runAgent(loop.client, { system: "s", tools: { a: { definition: def("a"), run: async () => "x" } }, prompt: "go", maxSteps: 3 });
  assert.deepEqual([r.status, r.steps, loop.requests.length], ["max_steps", 3, 3]);
  assert.deepEqual(r.usage, { inputTokens: 150, outputTokens: 15 });
  const ref = fakeClaude(() => message([], { stop_reason: "refusal" }));
  assert.equal((await runAgent(ref.client, { system: "s", tools: {}, prompt: "go" })).status, "refused");
  const cut = fakeClaude(() => message("חצי תשו", { stop_reason: "max_tokens" }));
  const c = await runAgent(cut.client, { system: "s", tools: {}, prompt: "go" });
  assert.deepEqual([c.status, c.text], ["truncated", "חצי תשו"]);
});
test("הבקשה: system, כלים, והמודל", async () => {
  const { client, bodies } = fakeClaude(() => message("hi"));
  await runAgent(client, { system: "אתה עוזר", tools: { a: { definition: def("a"), run: async () => "" } }, prompt: "שלום" });
  const b = bodies()[0];
  assert.equal(b.system, "אתה עוזר");
  assert.equal(b.model, "claude-opus-5-5");
  assert.deepEqual(b.tools, [def("a")]);
  assert.deepEqual(b.messages, [{ role: "user", content: "שלום" }]);
});
