// P25.7-E101: ממסמך הזמנה ל־JSON של API — תאריך לא ISO, סכום בלי כמות, ו־id "undefined" בקריאה השנייה.
// { id, customerId, status, createdAt (ISO), items, total = Σ price × qty } — בלי _id, ובלי לשנות את doc
//
// בדיקה:  npm run check P25.7-E101
import type { ObjectId } from "mongodb";

export interface OrderDoc {
  _id: ObjectId | string;
  customerId: string;
  status: string;
  createdAt: Date;
  items: { productId: string; name: string; price: number; qty: number }[];
}

export function toApiOrder(doc: OrderDoc) {
  const out: any = doc;
  out.id = String(doc._id);
  delete out._id;
  out.createdAt = String(doc.createdAt);
  out.total = doc.items.reduce((s, i) => s + i.price, 0);
  return out;
}
