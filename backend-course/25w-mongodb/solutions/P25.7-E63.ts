// P25.7-E63: $jsonSchema ל־customers
import type { Db } from "mongodb";

export async function createCustomersCollection(db: Db): Promise<void> {
  await db.createCollection("customers", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "email", "createdAt"],
        properties: {
          name: { bsonType: "string", minLength: 1 },
          email: { bsonType: "string", pattern: "^[^@\\s]+@[^@\\s]+$" },
          createdAt: { bsonType: "date" },
          city: { bsonType: "string" },
          addresses: { bsonType: "array", maxItems: 5, items: { bsonType: "object" } },
        },
      },
    },
  });
  await db.collection("customers").createIndex({ email: 1 }, { unique: true });
}
