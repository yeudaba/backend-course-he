// P25.7-E12
import type { Db } from "mongodb";

export async function createIndexes(db: Db) {
  // ESR: Equality (customerId) ← Sort (createdAt) — מתאים ל"ההזמנות של לקוח, מהחדשה"
  await db.collection("orders").createIndex({ customerId: 1, createdAt: -1 }, { name: "customer_recent" });
  await db.collection("products").createIndex({ category: 1, price: 1 }, { name: "category_price" });
  // TTL: Mongo מוחק לבד מסמכים שה־expiresAt שלהם עבר (תהליך רקע, בערך פעם בדקה)
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { name: "sessions_ttl", expireAfterSeconds: 0 });
}
