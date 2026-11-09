// טוען את נתוני הדוגמה ל־database בשם shop אצלך (מוחק אותו קודם). הרצה מתוך ~/dev/backend-course:
//   node 25w-mongodb/files/load-seed.mjs
import "dotenv/config";
import { MongoClient } from "mongodb";
import { seedShop } from "./seed.mjs";

const url = process.env.COURSE_MONGO_URL || "mongodb://localhost:27017/?directConnection=true";
const client = new MongoClient(url);
await client.connect();
const db = client.db("shop");
await db.dropDatabase();
await seedShop(db);
for (const c of ["products", "customers", "orders"]) console.log(`${c}: ${await db.collection(c).countDocuments()}`);
await client.close();
