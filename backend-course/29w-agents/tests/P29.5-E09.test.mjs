import { test } from "node:test";
import assert from "node:assert/strict";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { load } from "../../tools/load.mjs";
import { connect } from "./_mcp.mjs";

const { mcpToolsForClaude, callMcpTool } = await load(import.meta.url, "P29.5-E09.ts");
function server() {
  const s = new McpServer({ name: "t", version: "1" });
  s.registerTool("weather", { description: "Weather for a city", inputSchema: { city: z.string() } }, async ({ city }) =>
    city === "Atlantis" ? { content: [{ type: "text", text: "unknown city" }], isError: true } : { content: [{ type: "text", text: `${city}: 24°` }, { type: "text", text: "sunny" }] },
  );
  s.registerTool("crash", { description: "Always throws", inputSchema: {} }, async () => {
    throw new Error("kaboom");
  });
  return s;
}

test("mcpToolsForClaude: name, description, input_schema", async (t) => {
  const { client } = await connect(t, server());
  const tools = await mcpToolsForClaude(client);
  const w = tools.find((x) => x.name === "weather");
  assert.equal(w.description, "Weather for a city");
  assert.equal(w.input_schema.type, "object");
  assert.deepEqual(w.input_schema.required, ["city"]);
  assert.equal(w.input_schema.$schema, undefined);
  assert.deepEqual(Object.keys(w).sort(), ["description", "input_schema", "name"]);
  assert.deepEqual((await mcpToolsForClaude(client, { prefix: "srv_" })).map((x) => x.name).sort(), ["srv_crash", "srv_weather"]);
});
test("callMcpTool: tool_result, טקסטים מחוברים, ו־isError ← is_error", async (t) => {
  const { client } = await connect(t, server());
  assert.deepEqual(await callMcpTool(client, { type: "tool_use", id: "tu1", name: "weather", input: { city: "Haifa" } }), { type: "tool_result", tool_use_id: "tu1", content: "Haifa: 24°\nsunny" });
  const bad = await callMcpTool(client, { type: "tool_use", id: "tu2", name: "weather", input: { city: "Atlantis" } });
  assert.equal(bad.is_error, true);
  const crash = await callMcpTool(client, { type: "tool_use", id: "tu3", name: "crash", input: {} });
  assert.equal(crash.is_error, true);
  assert.match(crash.content, /kaboom/);
  assert.equal((await callMcpTool(client, { type: "tool_use", id: "tu4", name: "srv_weather", input: { city: "Eilat" } }, { prefix: "srv_" })).content, "Eilat: 24°\nsunny");
});
test("שרת שנסגר ← עדיין tool_result עם is_error (לא exception)", async (t) => {
  const { client } = await connect(t, server());
  await client.close();
  const r = await callMcpTool(client, { type: "tool_use", id: "tu5", name: "weather", input: { city: "Haifa" } });
  assert.equal(r.type, "tool_result");
  assert.equal(r.tool_use_id, "tu5");
  assert.equal(r.is_error, true);
});
