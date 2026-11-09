import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, userText } from "./_claude.mjs";

const { runLead } = await load(import.meta.url, "P29.5-E15.ts");
const workers = { researcher: { system: "You research products." }, writer: { system: "You write short copy." } };

function responder(lead, timings) {
  return async (b) => {
    if (b.system === workers.researcher.system || b.system === workers.writer.system) {
      const start = Date.now();
      await new Promise((r) => setTimeout(r, 80));
      timings.push([start, Date.now()]);
      return message(`[${b.system.startsWith("You research") ? "research" : "copy"}] ${userText(b.messages[0])}`);
    }
    return lead(b);
  };
}

test("המוביל מאציל לשני עובדים במקביל, ומקבל את הדוחות שלהם", async () => {
  const timings = [];
  let leadCalls = 0;
  const { client, bodies } = fakeClaude(
    responder((b) => {
      leadCalls++;
      if (leadCalls === 1)
        return message([toolUse("delegate", { worker: "researcher", instructions: "השווה 3 מטחנות ידניות" }, "d1"), toolUse("delegate", { worker: "writer", instructions: "כותרת לדף מטחנות" }, "d2")], { stop_reason: "tool_use" });
      return message("סיכום: " + b.messages.at(-1).content.map((r) => r.content).join(" | "));
    }, timings),
  );
  const out = await runLead(client, { system: "You are the lead.", task: "בנה דף מטחנות", workers });
  assert.equal(out, "סיכום: [research] השווה 3 מטחנות ידניות | [copy] כותרת לדף מטחנות");
  assert.equal(timings.length, 2);
  assert.ok(timings[1][0] < timings[0][1], "העובדים רצו במקביל");
  const delegateTool = bodies()[0].tools[0];
  assert.equal(delegateTool.name, "delegate");
  assert.deepEqual(delegateTool.input_schema.properties.worker.enum, ["researcher", "writer"]);
});
test("עובד מתחיל בהקשר נקי — בלי ההיסטוריה של המוביל", async () => {
  let leadCalls = 0;
  const { client, bodies } = fakeClaude(
    responder(() => (++leadCalls === 1 ? message([toolUse("delegate", { worker: "researcher", instructions: "מה המחיר של V60?" })], { stop_reason: "tool_use" }) : message("done")), []),
  );
  await runLead(client, { system: "You are the lead.", task: "סודי: קוד הנחה 1234. מצא מחיר V60", workers });
  const w = bodies().find((b) => b.system === workers.researcher.system);
  assert.equal(w.messages.length, 1);
  assert.equal(userText(w.messages[0]), "מה המחיר של V60?");
  assert.doesNotMatch(JSON.stringify(w), /1234/, "העובד לא רואה את המשימה המקורית");
  assert.equal(w.tools, undefined, "לעובד אין את כלי ה־delegate");
});
test("עובד שלא קיים ← is_error; דוח ארוך מקוצר", async () => {
  let leadCalls = 0;
  const { client, bodies } = fakeClaude(async (b) => {
    if (b.system === workers.writer.system) return message("x".repeat(5000));
    return ++leadCalls === 1 ? message([toolUse("delegate", { worker: "hacker", instructions: "x" }, "h"), toolUse("delegate", { worker: "writer", instructions: "y" }, "w")], { stop_reason: "tool_use" }) : message("ok");
  });
  await runLead(client, { system: "lead", task: "t", workers });
  const results = bodies().filter((b) => b.system === "lead")[1].messages.at(-1).content;
  assert.equal(results[0].is_error, true);
  assert.ok(results[1].content.length <= 2100, `הדוח ${results[1].content.length} תווים — מציף את ההקשר של המוביל`);
});
