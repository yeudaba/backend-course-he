// P25.7-E35: לקוחות בעיר
import type { Db } from "mongodb";

export async function customersInCity(db: Db, city: string) {
  return (await db.collection("customers")
    .find({ city }, { projection: { _id: 0, name: 1, email: 1 } })
    .sort({ name: 1 })
    .toArray()) as unknown as { name: string; email: string }[];
}
