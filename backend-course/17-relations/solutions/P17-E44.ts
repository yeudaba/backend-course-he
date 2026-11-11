// P17-E44: הוספת פריט מ־Node, עם קודי השגיאה
export type Db = { query(text: string, values?: unknown[]): Promise<{ rows: any[] }> };
export type AddResult = { ok: true; unitPrice: number } | { ok: false; error: "not_found" | "duplicate" | "invalid" };

const ERRORS: Record<string, "not_found" | "duplicate" | "invalid"> = {
  "23503": "not_found", // foreign key: אין הזמנה כזו
  "23505": "duplicate", // המפתח הראשי (order_id, product_id)
  "23514": "invalid", // CHECK (quantity > 0)
};

export async function addOrderItem(client: Db, orderId: number, productId: number, quantity: number): Promise<AddResult> {
  const { rows } = await client.query("SELECT price FROM products WHERE id = $1 AND is_active", [productId]);
  if (rows.length === 0) return { ok: false, error: "not_found" };
  const unitPrice = Number(rows[0].price);
  try {
    await client.query("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)", [orderId, productId, quantity, unitPrice]);
  } catch (err: any) {
    const error = ERRORS[err.code];
    if (error) return { ok: false, error };
    throw err;
  }
  return { ok: true, unitPrice };
}
