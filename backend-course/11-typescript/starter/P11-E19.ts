// P11-E19: מלאי = Map<string, number>. אף פונקציה לא משנה את הקלט.
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export type Inventory = Map<string, number>;

export function restock(inv: Inventory, code: string, qty: number): Inventory {
  // כתוב כאן
}

// "מוצר לא קיים" | "אין מספיק במלאי"
export function reserve(inv: Inventory, code: string, qty: number): Result<Inventory> {
  // כתוב כאן
}

// קודים ממוינים שהכמות שלהם < threshold
export function lowStock(inv: Inventory, threshold: number): string[] {
  // כתוב כאן
}
