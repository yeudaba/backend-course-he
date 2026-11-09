// P25.7-E21: PATCH /me — עדכון פרופיל. שלוש תקלות
import type { Db } from "mongodb";

interface Customer {
  _id: string;
  name: string;
  email: string;
  city: string;
  createdAt: Date;
}

export async function updateProfile(db: Db, customerId: string, body: Record<string, unknown>) {
  if (Object.keys(body).length === 0) throw new RangeError("אין מה לעדכן");
  db.collection<Customer>("customers").replaceOne({ _id: customerId }, body as unknown as Customer);
  return db.collection<Customer>("customers").findOne({ _id: customerId });
}
