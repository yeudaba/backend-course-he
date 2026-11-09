// P29.5-E08: שרת MCP — הכלים של החנות, לכל סוכן שמדבר MCP
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Store } from "../files/store.ts";

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const error = (t: string) => ({ ...text(t), isError: true });

// customerId מגיע מהשרת (מי מחובר), לא מהמודל — המודל לא יכול לבקש הזמנה של לקוח אחר
export function createCoffeeMcpServer(store: Store, customerId: number): McpServer {
  throw new Error("עוד לא כתבת את הפתרון");
}
