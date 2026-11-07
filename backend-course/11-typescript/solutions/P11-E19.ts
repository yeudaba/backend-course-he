// P11-E19
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export type Inventory = Map<string, number>;

export function restock(inv: Inventory, code: string, qty: number): Inventory {
  const next = new Map(inv);
  next.set(code, (next.get(code) ?? 0) + qty);
  return next;
}

export function reserve(inv: Inventory, code: string, qty: number): Result<Inventory> {
  const current = inv.get(code);
  if (current === undefined) {
    return { ok: false, error: "מוצר לא קיים" };
  }
  if (current < qty) {
    return { ok: false, error: "אין מספיק במלאי" };
  }
  const next = new Map(inv);
  next.set(code, current - qty);
  return { ok: true, value: next };
}

export function lowStock(inv: Inventory, threshold: number): string[] {
  return [...inv].filter(([, qty]) => qty < threshold).map(([code]) => code).sort();
}

const inv = new Map([["A", 5], ["B", 1]]);
const r = reserve(inv, "A", 2);
console.log(r.ok && r.value.get("A"), inv.get("A"), lowStock(inv, 3));
