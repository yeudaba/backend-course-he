// P19.5-E13
import type { Pool } from "mysql2/promise";

// הורדת מלאי בפקודה אחת, מותנית. ב־MySQL: affectedRows = כמה שורות *התאימו* ל־WHERE ושונו.
// (changedRows — רק שורות שהערך בהן באמת השתנה. כאן זה אותו דבר, אבל ב־UPDATE שקובע ערך זהה — changedRows הוא 0)
export async function reserveStock(pool: Pool, productId: number, quantity: number): Promise<boolean> {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("כמות לא תקינה");
  const [res] = await pool.execute<any>("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?", [quantity, productId, quantity]);
  return res.affectedRows === 1;
}
