// נתוני הדגמה: npm run db:seed (מוחק מוצרים קיימים שלא הוזמנו, ומוסיף קטלוג)
import "dotenv/config";
import pg from "pg";

const PRODUCTS = [
  ["מטחנה ידנית קרמית", "מטחנה ידנית עם להבים קרמיים, 20 דרגות טחינה", 24900, 8, "grinders"],
  ["מטחנה חשמלית Burr", "מטחנת conical burr, 40 דרגות, מתאימה לאספרסו", 89900, 3, "grinders"],
  ["קומקום צוואר אווז", "קומקום 1 ליטר לחליטה ידנית, עם מדחום", 32900, 6, "kettles"],
  ["V60 קרמי", "דריפר קרמי למזיגה ידנית, מידה 02", 11900, 15, "brewers"],
  ["פרנץ' פרס 1 ליטר", "זכוכית ונירוסטה, 8 כוסות", 14900, 10, "brewers"],
  ["פילטרים לבנים V60", "100 פילטרי נייר, מידה 02", 2990, 40, "filters"],
  ["כוסות אספרסו (4)", "פורצלן כפול דופן, 80 מ\"ל", 8900, 0, "cups"],
  ["משקל קפה עם טיימר", "דיוק 0.1 גרם, טעינת USB", 15900, 5, "accessories"],
] as const;

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query("DELETE FROM products WHERE id NOT IN (SELECT product_id FROM order_items)");
for (const [name, description, priceCents, stock, category] of PRODUCTS) {
  await client.query("INSERT INTO products (name, description, price_cents, stock, category, updated_at) VALUES ($1, $2, $3, $4, $5, now())", [name, description, priceCents, stock, category]);
}
console.log(`✔ ${PRODUCTS.length} מוצרים`);
await client.end();
