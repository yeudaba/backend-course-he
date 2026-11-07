// טוען את prisma/seed.sql למסד של הפרק. מופעל על ידי:  npx prisma db seed
import fs from "node:fs";
import { config } from "dotenv";
import pg from "pg";

config({ path: "../../.env" });
const client = new pg.Client({ connectionString: process.env.SHOP_DATABASE_URL });
await client.connect();
await client.query(fs.readFileSync("prisma/seed.sql", "utf8"));
await client.end();
console.log("✔ נתוני הדוגמה נטענו");
