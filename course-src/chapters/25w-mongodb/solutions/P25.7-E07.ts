// P25.7-E07
import { MongoServerError, type Db } from "mongodb";

export class DuplicateEmailError extends Error {}

export async function setupCustomers(db: Db) {
  // ה־UNIQUE של Mongo: אינדקס ייחודי. בלעדיו — שני לקוחות עם אותו אימייל יישמרו בשקט
  await db.collection("customers").createIndex({ email: 1 }, { unique: true });
}

export async function createCustomer(db: Db, { name, email, city }: { name: string; email: string; city: string }) {
  try {
    const { insertedId } = await db.collection("customers").insertOne({ name, email: email.trim().toLowerCase(), city, createdAt: new Date() });
    return insertedId; // לא נתנו _id ← Mongo יוצר ObjectId
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) throw new DuplicateEmailError(`האימייל ${email} כבר רשום`);
    throw err;
  }
}
