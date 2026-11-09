// עוזר לבדיקות של יחידה 25.7 (MongoDB): כל בדיקה מקבלת database נקי משלה, עם נתוני דוגמה מ־files/seed.mjs,
// ומוחקת אותו בסוף. החיבור: COURSE_MONGO_URL ב־.env של תיקיית הקורס (יחידה 25.7, קופסת 🧰)
import path from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { MongoClient } from "mongodb";

export const mongoUrl = process.env.COURSE_MONGO_URL || "mongodb://localhost:27017/?directConnection=true";

export async function mongoSandbox(t, testUrl, { seed = true } = {}) {
  const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 3000 });
  try {
    await client.connect();
  } catch (err) {
    await client.close().catch(() => {});
    throw new Error(`אין חיבור ל־MongoDB (${mongoUrl}): ${err.message}. הרץ את הקונטיינר (יחידה 25.7, קופסת 🧰) ובדוק את COURSE_MONGO_URL ב־.env`);
  }
  const name = `chk_${process.pid}_${randomBytes(3).toString("hex")}`;
  const db = client.db(name);
  t.after(async () => {
    await db.dropDatabase().catch(() => {});
    await client.close().catch(() => {});
  });
  if (seed) {
    const file = path.join(path.dirname(fileURLToPath(testUrl)), "..", "files", "seed.mjs");
    const { seedShop } = await import(pathToFileURL(file).href);
    await seedShop(db);
  }
  return { client, db, name };
}
