import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse } from "./_claude.mjs";

const { agentEvents } = await load(import.meta.url, "P29.5-E19.ts");
const def = (name) => ({ name, description: name, input_schema: { type: "object", properties: {} } });
const collect = async (gen) => {
  const out = [];
  for await (const e of gen) out.push(e);
  return out;
};

test("אירועים בסדר: model ← tool_start/tool_end ← model ← done", async () => {
  const { client } = fakeClaude((b, i) => (i === 0 ? message([toolUse("a", {}, "t1"), toolUse("b", {}, "t2")], { stop_reason: "tool_use" }) : message("גמרתי")));
  const tools = { a: { definition: def("a"), run: async () => "A" }, b: { definition: def("b"), run: async () => { throw new Error("x"); } } };
  assert.deepEqual(await collect(agentEvents(client, { system: "s", tools, prompt: "go" })), [
    { type: "model", step: 1, stopReason: "tool_use" },
    { type: "tool_start", id: "t1", name: "a" },
    { type: "tool_end", id: "t1", name: "a", isError: false },
    { type: "tool_start", id: "t2", name: "b" },
    { type: "tool_end", id: "t2", name: "b", isError: true },
    { type: "model", step: 2, stopReason: "end_turn" },
    { type: "done", text: "גמרתי" },
  ]);
});
test("שגיאת API ← אירוע error (לא exception שמפיל את ה־SSE)", async () => {
  const { client } = fakeClaude(() => ({ error: 529 }));
  const ev = await collect(agentEvents(client, { system: "s", tools: {}, prompt: "go" }));
  assert.equal(ev.at(-1).type, "error");
});
test("generator עצל: לא קורא למודל לפני שמבקשים אירוע", async () => {
  const { client, requests } = fakeClaude(() => message("hi"));
  const gen = agentEvents(client, { system: "s", tools: {}, prompt: "go" });
  assert.equal(requests.length, 0);
  await gen.next();
  assert.equal(requests.length, 1);
});
