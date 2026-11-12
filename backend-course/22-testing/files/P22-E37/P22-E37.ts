// P22-E37 — הקוד שבודקים (לא משנים אותו)
export class Cart {
  #items = new Map<string, { priceAgorot: number; qty: number }>();

  // אותו sku מצטבר (המחיר — האחרון). עד 10 יחידות מכל sku. מחיר 0 = מתנה
  add(sku: string, priceAgorot: number, qty = 1): void {
    if (!Number.isInteger(qty) || qty < 1) throw new RangeError("כמות לא תקינה");
    if (!Number.isInteger(priceAgorot) || priceAgorot < 0) throw new RangeError("מחיר לא תקין");
    const total = (this.#items.get(sku)?.qty ?? 0) + qty;
    if (total > 10) throw new RangeError("עד 10 יחידות מכל מוצר");
    this.#items.set(sku, { priceAgorot, qty: total });
  }

  remove(sku: string): boolean {
    return this.#items.delete(sku);
  }

  // סך היחידות
  get count(): number {
    let n = 0;
    for (const item of this.#items.values()) n += item.qty;
    return n;
  }

  totalAgorot(): number {
    let sum = 0;
    for (const item of this.#items.values()) sum += item.priceAgorot * item.qty;
    return sum;
  }
}
