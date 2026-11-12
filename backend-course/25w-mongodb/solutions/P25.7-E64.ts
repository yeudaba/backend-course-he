// P25.7-E64: עד 5 כתובות — בפקודה אחת
import type { Db } from "mongodb";

export async function addAddress(db: Db, customerId: string, address: { label: string; street: string; city: string }) {
  const customers = db.collection<{ _id: string; addresses?: object[] }>("customers");
  const r = await customers.updateOne({ _id: customerId, "addresses.4": { $exists: false } }, { $push: { addresses: address } });
  if (r.modifiedCount === 1) return "added" as const;
  return (await customers.countDocuments({ _id: customerId }, { limit: 1 })) ? ("limit" as const) : ("not_found" as const);
}
