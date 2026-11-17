// P11-E56: אינדקס לפי מזהה
export type Product = { id: number; name: string; price: number };

export function indexById(products: Product[]): Map<number, Product> {
  const index = new Map<number, Product>();
  for (const p of products) {
    if (index.has(p.id)) throw new Error(`מזהה כפול: ${p.id}`);
    index.set(p.id, p);
  }
  return index;
}

export function missingIds(ids: number[], index: Map<number, Product>): number[] {
  const missing = new Set<number>();
  for (const id of ids) {
    if (!index.has(id)) missing.add(id);
  }
  return [...missing];
}

export function orderTotal(lines: { id: number; qty: number }[], index: Map<number, Product>): number {
  let total = 0;
  for (const line of lines) {
    const p = index.get(line.id);
    if (!p) throw new Error(`אין מוצר ${line.id}`);
    total += p.price * line.qty;
  }
  return total;
}

const index = indexById([
  { id: 1, name: "עט", price: 5 },
  { id: 2, name: "מחברת", price: 12 },
]);
console.log(missingIds([1, 7, 2, 7, 9], index));
console.log(orderTotal([{ id: 1, qty: 3 }, { id: 2, qty: 1 }], index));
