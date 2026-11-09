// P29.5-E09: גשר בין MCP ל־Messages API — הכלים של שרת MCP, כלים של Claude
import type Anthropic from "@anthropic-ai/sdk";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

export async function mcpToolsForClaude(mcp: Client, { prefix = "" } = {}): Promise<Anthropic.Tool[]> {
  const out: Anthropic.Tool[] = [];
  let cursor: string | undefined;
  do {
    const page = await mcp.listTools(cursor ? { cursor } : {}); // שרת יכול להחזיר רשימה בעמודים
    for (const t of page.tools) {
      const { $schema, ...schema } = t.inputSchema as Record<string, unknown>;
      out.push({ name: prefix + t.name, description: t.description ?? "", input_schema: schema as Anthropic.Tool.InputSchema });
    }
    cursor = page.nextCursor;
  } while (cursor);
  return out;
}

export async function callMcpTool(mcp: Client, call: Anthropic.ToolUseBlock, { prefix = "" } = {}): Promise<Anthropic.ToolResultBlockParam> {
  const name = call.name.startsWith(prefix) ? call.name.slice(prefix.length) : call.name;
  try {
    const res = await mcp.callTool({ name, arguments: call.input as Record<string, unknown> });
    const content = (res.content as { type: string; text?: string }[])
      .map((c) => (c.type === "text" ? c.text : `[${c.type}]`))
      .join("\n");
    return { type: "tool_result", tool_use_id: call.id, content, ...(res.isError ? { is_error: true } : {}) };
  } catch (err) {
    // שרת שנפל / timeout — עדיין tool_result, כדי שהשיחה תישאר תקינה
    return { type: "tool_result", tool_use_id: call.id, content: `שרת ה־MCP נכשל: ${(err as Error).message}`, is_error: true };
  }
}
