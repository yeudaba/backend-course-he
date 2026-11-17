import { test } from "node:test";
import assert from "node:assert/strict";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { load } from "../../tools/load.mjs";
import { connect } from "./_mcp.mjs";

const { allowlist } = await load(import.meta.url, "P29.5-E48.ts");

test("עם שרת MCP אמיתי: רק המותרים, והשאר לא מגיעים לשרת", async (t) => {
  const called = [];
  const server = new McpServer({ name: "third-party", version: "1.0.0" });
  for (const name of ["search_docs", "get_doc", "delete_doc", "read_file"]) {
    server.registerTool(name, { description: `${name} tool for testing`, inputSchema: { id: z.string().optional() } }, async (a) => (called.push(name), { content: [{ type: "text", text: `${name}:${a.id ?? ""}` }] }));
  }
  const { client } = await connect(t, server);
  const safe = allowlist(client, ["get_doc", "search_docs"]);
  assert.deepEqual((await safe.listTools()).tools.map((x) => x.name), ["search_docs", "get_doc"], "בסדר של השרת");
  assert.deepEqual(await safe.callTool({ name: "get_doc", arguments: { id: "7" } }), { content: [{ type: "text", text: "get_doc:7" }] });
  assert.deepEqual(await safe.callTool({ name: "delete_doc", arguments: { id: "7" } }), { content: [{ type: "text", text: "tool not allowed: delete_doc" }], isError: true });
  assert.deepEqual(await safe.callTool({ name: "nope" }), { content: [{ type: "text", text: "tool not allowed: nope" }], isError: true });
  assert.deepEqual(called, ["get_doc"]);
});
test("כל העמודים של listTools", async () => {
  const pages = { "": { tools: [{ name: "a" }, { name: "b" }], nextCursor: "p2" }, p2: { tools: [{ name: "c" }], nextCursor: "p3" }, p3: { tools: [{ name: "d" }, { name: "a2" }] } };
  const seen = [];
  const fake = { listTools: async (p = {}) => (seen.push(p.cursor ?? ""), pages[p.cursor ?? ""]), callTool: async () => assert.fail("לא אמור להיקרא") };
  const r = await allowlist(fake, ["d", "a", "c"]).listTools();
  assert.deepEqual(r.tools.map((x) => x.name), ["a", "c", "d"]);
  assert.deepEqual(seen, ["", "p2", "p3"]);
  assert.equal(r.nextCursor, undefined);
});
