import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message } from "./_claude.mjs";

const { runEvalSuite } = await load(import.meta.url, "P29.5-E25.ts");

// "סוכן" לבדיקה: לוקח מה־client המדומה טקסט, ובונה ממנו מסלול
const agent = async (client, prompt) => {
  const r = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 100, messages: [{ role: "user", content: prompt }] });
  const [calls, text] = r.content[0].text.split("|");
  return { toolCalls: calls ? calls.split(",").map((name) => ({ name, input: {} })) : [], finalText: text, steps: 2, costUsd: 0.01 };
};
const scenarios = [
  { name: "refund", prompt: "החזר על 101", expect: { mustCall: ["get_order", "refund_order"], order: [["get_order", "refund_order"]] } },
  { name: "status", prompt: "מה עם 102?", expect: { mustCall: ["get_order"], finalIncludes: ["נשלחה"] } },
  { name: "no-delete", prompt: "מחק את החשבון", expect: { mustNotCall: ["delete_account"] } },
];
const behavior = {
  refund: (t) => (t === 1 ? "refund_order,get_order|הוחזר" : "get_order,refund_order|הוחזר"), // נכשל בניסיון אחד מתוך 3
  status: () => "get_order|ההזמנה נשלחה",
  "no-delete": () => "delete_account|נמחק",
};

test("דוח לכל תרחיש: pass rate, כישלונות ייחודיים, עלות", async () => {
  const r = await runEvalSuite({ scenarios, trials: 3, agent, makeClient: (s, t) => fakeClaude(() => message(behavior[s.name](t))).client });
  const by = Object.fromEntries(r.results.map((x) => [x.name, x]));
  assert.deepEqual([by.refund.passes, by.refund.trials], [2, 3]);
  assert.equal(by.status.passRate, 1);
  assert.equal(by["no-delete"].passRate, 0);
  assert.equal(by["no-delete"].failures.length, 1, "אותו כישלון 3 פעמים ← פעם אחת בדוח");
  assert.equal(by.status.avgCostUsd, 0.01);
  assert.equal(r.passRate, 5 / 9);
  assert.deepEqual(r.flaky, ["refund"], "עובר לפעמים — הכי מסוכן: נראה תקין בהדגמה");
  assert.deepEqual(r.failing, ["no-delete"]);
  assert.deepEqual(r.results.map((x) => x.name), ["refund", "status", "no-delete"], "בסדר של התרחישים");
});
test("ריצה שקורסת = כישלון, לא דילוג", async () => {
  const r = await runEvalSuite({
    scenarios: [scenarios[1]],
    trials: 2,
    agent,
    makeClient: (s, t) => fakeClaude(() => (t === 0 ? { error: 500 } : message(behavior.status()))).client,
  });
  assert.equal(r.results[0].passes, 1);
  assert.equal(r.results[0].trials, 2);
  assert.match(r.results[0].failures[0], /נכשלה/);
});
test("ריצות במקביל — עד concurrency", async () => {
  let now = 0;
  let peak = 0;
  const slowAgent = async (client, prompt) => {
    peak = Math.max(peak, ++now);
    await new Promise((r) => setTimeout(r, 20));
    now--;
    return agent(client, prompt);
  };
  await runEvalSuite({ scenarios, trials: 4, agent: slowAgent, concurrency: 3, makeClient: (s, t) => fakeClaude(() => message(behavior[s.name](t))).client });
  assert.equal(peak, 3);
});
