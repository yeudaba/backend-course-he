// P29.5-E08: שרת MCP — הכלים של החנות, לכל סוכן שמדבר MCP
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Store } from "../files/store.ts";

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const error = (t: string) => ({ ...text(t), isError: true });

// customerId מגיע מהשרת (מי מחובר), לא מהמודל — המודל לא יכול לבקש הזמנה של לקוח אחר
export function createCoffeeMcpServer(store: Store, customerId: number): McpServer {
  const server = new McpServer({ name: "coffee-shop", version: "1.0.0" });

  server.registerTool(
    "search_products",
    {
      description: "Search the coffee shop catalog by name. Returns id, name, price in ILS and whether it is in stock.",
      inputSchema: { query: z.string().min(2).max(50) },
      annotations: { readOnlyHint: true },
    },
    async ({ query }) => {
      const q = query.toLowerCase();
      const found = store.products
        .filter((p) => p.name.toLowerCase().includes(q))
        .map((p) => ({ id: p.id, name: p.name, price: p.priceCents / 100, inStock: p.stock > 0 }));
      return text(JSON.stringify(found));
    },
  );

  server.registerTool(
    "get_order",
    {
      description: "Get one of the signed-in customer's orders by order id: status, total in ILS and items.",
      inputSchema: { orderId: z.number().int().positive() },
      annotations: { readOnlyHint: true },
    },
    async ({ orderId }) => {
      const o = store.orders.get(orderId);
      // הזמנה של לקוח אחר — בדיוק כמו "לא קיימת": לא מגלים שהיא קיימת
      if (!o || o.customerId !== customerId) return error(`הזמנה ${orderId} לא נמצאה`);
      return text(JSON.stringify({ id: o.id, status: o.status, total: o.totalCents / 100, items: o.items }));
    },
  );

  server.registerTool(
    "list_my_orders",
    {
      description: "List the signed-in customer's orders (id, status, total in ILS), newest first.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const mine = [...store.orders.values()].filter((o) => o.customerId === customerId).sort((a, b) => b.id - a.id);
      return text(JSON.stringify(mine.map((o) => ({ id: o.id, status: o.status, total: o.totalCents / 100 }))));
    },
  );
  return server;
}
