// P29.5-E09: גשר בין MCP ל־Messages API — הכלים של שרת MCP, כלים של Claude
import type Anthropic from "@anthropic-ai/sdk";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

export async function mcpToolsForClaude(mcp: Client, { prefix = "" } = {}): Promise<Anthropic.Tool[]> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function callMcpTool(mcp: Client, call: Anthropic.ToolUseBlock, { prefix = "" } = {}): Promise<Anthropic.ToolResultBlockParam> {
  throw new Error("עוד לא כתבת את הפתרון");
}
