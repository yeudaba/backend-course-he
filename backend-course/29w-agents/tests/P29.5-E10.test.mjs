import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse } from "./_claude.mjs";

const { advance, startState } = await load(import.meta.url, "P29.5-E10.ts");
const def = (name) => ({ name, description: name, input_schema: { type: "object", properties: {} } });

function setup() {
  const log = [];
  const cfg = {
    system: "s",
    tools: {
      get_order: { definition: def("get_order"), run: async (i) => (log.push(["get", i.id]), `order ${i.id}: paid`) },
      refund: { definition: def("refund"), run: async (i) => (log.push(["refund", i.id]), `refunded ${i.id}`) },
    },
    needsApproval: (name) => name === "refund",
  };
  return { log, cfg };
}

test("עוצר לפני refund — ולא מריץ כלום מאותו תור", async () => {
  const { log, cfg } = setup();
  const { client } = fakeClaude(() => message([toolUse("get_order", { id: 7 }, "g1"), toolUse("refund", { id: 7 }, "r1")], { stop_reason: "tool_use" }));
  const r = await advance(client, cfg, startState("החזר על 7"));
  assert.equal(r.status, "needs_approval");
  assert.deepEqual(r.pending, [{ id: "r1", name: "refund", input: { id: 7 } }]);
  assert.deepEqual(log, [], "כלום לא רץ לפני ההחלטה");
  assert.deepEqual(JSON.parse(JSON.stringify(r.state)), r.state, "המצב ניתן לשמירה כ־JSON");
});
test("אישור ← כל הכלים של התור רצים, ותוצאות בהודעה אחת; השיחה ממשיכה", async () => {
  const { log, cfg } = setup();
  const { client, bodies } = fakeClaude((b, i) => (i === 0 ? message([toolUse("get_order", { id: 7 }, "g1"), toolUse("refund", { id: 7 }, "r1")], { stop_reason: "tool_use" }) : message("הוחזר")));
  const first = await advance(client, cfg, startState("החזר על 7"));
  const saved = JSON.parse(JSON.stringify(first.state)); // "נשמר במסד, וחזר אחרי שעה"
  const r = await advance(client, cfg, saved, { r1: "approve" });
  assert.deepEqual([r.status, r.text], ["done", "הוחזר"]);
  assert.deepEqual(log, [["get", 7], ["refund", 7]]);
  assert.deepEqual(bodies()[1].messages.at(-1).content.map((b) => [b.tool_use_id, b.is_error ?? false]), [["g1", false], ["r1", false]]);
});
test("סירוב ← is_error למודל, refund לא רץ", async () => {
  const { log, cfg } = setup();
  const { client, bodies } = fakeClaude((b, i) => (i === 0 ? message([toolUse("refund", { id: 9 }, "r9")], { stop_reason: "tool_use" }) : message("בסדר, לא החזרתי")));
  const first = await advance(client, cfg, startState("החזר על 9"));
  const r = await advance(client, cfg, first.state, { r9: "deny" });
  assert.equal(r.status, "done");
  assert.deepEqual(log, []);
  const res = bodies()[1].messages.at(-1).content[0];
  assert.equal(res.is_error, true);
});
test("בלי החלטה ← עדיין ממתין; ו־advance לא משנה את ה־state שקיבל", async () => {
  const { cfg } = setup();
  const { client, requests } = fakeClaude(() => message([toolUse("refund", { id: 1 }, "r1")], { stop_reason: "tool_use" }));
  const first = await advance(client, cfg, startState("x"));
  const copy = JSON.stringify(first.state);
  const again = await advance(client, cfg, first.state, {});
  assert.equal(again.status, "needs_approval");
  assert.equal(requests.length, 1, "לא קרא שוב למודל");
  assert.equal(JSON.stringify(first.state), copy);
});
test("כלים שלא צריכים אישור — רצים בלי לעצור", async () => {
  const { log, cfg } = setup();
  const { client } = fakeClaude((b, i) => (i === 0 ? message([toolUse("get_order", { id: 3 })], { stop_reason: "tool_use" }) : message("ההזמנה שולמה")));
  const r = await advance(client, cfg, startState("מה עם 3?"));
  assert.deepEqual([r.status, r.text, log], ["done", "ההזמנה שולמה", [["get", 3]]]);
});
