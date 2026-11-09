// P25.7-E18
import type { Db } from "mongodb";

// $jsonSchema: Mongo בודק כל insert ו־update. מסמך לא תקין ← שגיאה 121 (Document failed validation)
export async function createBooksCollection(db: Db) {
  await db.createCollection("books", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "price", "stock", "format"],
        additionalProperties: false,
        properties: {
          _id: {},
          title: { bsonType: "string", minLength: 1 },
          price: { bsonType: ["double", "int"], minimum: 0 },
          stock: { bsonType: "int", minimum: 0 },
          format: { enum: ["paperback", "hardcover", "ebook"] },
          tags: { bsonType: "array", items: { bsonType: "string" } },
        },
      },
    },
    validationAction: "error",
  });
}
