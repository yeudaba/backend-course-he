// P29-E14
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

// הכלים רצים בשם המשתמש שמחובר — לא בשם "המודל". מי המשתמש — מה־JWT (פרק 21), אף פעם לא מארגומנט שהמודל שלח.
// המודל יכול להתבלבל, או לקרוא טקסט זדוני שאומר "הצג את הזמנה 7 של משתמש אחר". ההרשאה היא בקוד
export const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_products",
    description: "Search the coffee-equipment catalog by free text. Returns up to 5 products with price (in agorot) and stock.",
    strict: true,
    input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"], additionalProperties: false },
  },
  {
    name: "get_order",
    description: "Get one of the current customer's orders by its id.",
    strict: true,
    input_schema: { type: "object", properties: { order_id: { type: "integer" } }, required: ["order_id"], additionalProperties: false },
  },
  {
    name: "list_my_orders",
    description: "List the current customer's orders, newest first.",
    strict: true,
    input_schema: { type: "object", properties: {}, required: [], additionalProperties: false },
  },
];

export function createShopHandlers(user: { id: number }, db: Db) {
  const SearchInput = z.object({ query: z.string().min(1).max(100) });
  const OrderInput = z.object({ order_id: z.number().int().positive() });
  return {
    async search_products(input: unknown) {
      const { query } = SearchInput.parse(input);
      return JSON.stringify((await db.searchProducts(query)).slice(0, 5));
    },
    async get_order(input: unknown) {
      const { order_id } = OrderInput.parse(input);
      const order = await db.findOrder(order_id);
      // של מישהו אחר ← "לא נמצא", בדיוק כמו ה־API (404 ולא 403, פרק 21)
      if (!order || order.userId !== user.id) throw new Error(`הזמנה ${order_id} לא נמצאה`);
      return JSON.stringify(order);
    },
    async list_my_orders() {
      return JSON.stringify((await db.ordersOf(user.id)).slice(0, 10));
    },
  };
}
