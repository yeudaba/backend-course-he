// P25.7-E101: ממסמך הזמנה ל־JSON של API — מתוקן
import type { ObjectId } from "mongodb";

export interface OrderDoc {
  _id: ObjectId | string;
  customerId: string;
  status: string;
  createdAt: Date;
  items: { productId: string; name: string; price: number; qty: number }[];
}

export function toApiOrder(doc: OrderDoc) {
  const { _id, createdAt, items, ...rest } = doc;
  return {
    ...rest,
    id: _id,
    createdAt: createdAt.toISOString(),
    items: items.map((i) => ({ ...i })),
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
  };
}
