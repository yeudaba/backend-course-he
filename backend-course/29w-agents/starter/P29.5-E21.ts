// P29.5-E21: שרת MCP של הזמנות — שלוש תקלות
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Store } from "../files/store.ts";

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const error = (t: string) => ({ ...text(t), isError: true });

export function createOrdersMcpServer(store: Store, customerId: number): McpServer {
  const server = new McpServer({ name: "orders", version: "1.0.0" });
  server.registerTool(
    "get_order",
    { description: "Get one of the signed-in customer's orders by id: status, total in ILS, items.", inputSchema: { orderId: z.number().int().positive() } },
    async ({ orderId }) => {
      const o = store.orders.get(orderId);
      if (!o) return error(`הזמנה ${orderId} לא נמצאה`);
      return text(JSON.stringify({ id: o.id, status: o.status, total: o.totalCents / 100 }));
    },
  );
  server.registerTool(
    "cancel_order",
    { description: "Cancel order", inputSchema: { orderId: z.number().int().positive() } },
    async ({ orderId }) => {
      const o = store.orders.get(orderId);
      if (!o || o.customerId !== customerId) return error(`הזמנה ${orderId} לא נמצאה`);
      o.status = "cancelled";
      return text(`הזמנה ${orderId} בוטלה`);
    },
  );
  return server;
}
