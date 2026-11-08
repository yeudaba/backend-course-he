// P29-E14: כלים לעוזר של החנות — עם הרשאות
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export interface Order {
  id: number;
  userId: number;
  status: "pending_payment" | "paid" | "shipped" | "cancelled";
  totalCents: number;
}
export interface Db {
  findOrder(id: number): Promise<Order | undefined>;
  ordersOf(userId: number): Promise<Order[]>;
  searchProducts(q: string): Promise<{ id: number; name: string; priceCents: number; stock: number }[]>;
}

// שלושה כלים: search_products ({ query }), get_order ({ order_id }), list_my_orders ({})
export const TOOLS: Anthropic.Tool[] = [];

export function createShopHandlers(user: { id: number }, db: Db): Record<string, (input: unknown) => Promise<string>> {
  throw new Error("עוד לא כתבת את הפתרון");
}
