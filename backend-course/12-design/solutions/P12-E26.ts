// P12-E26: מחסן כמחלקה
export class Inventory {
  #items = new Map<string, number>();

  #checkQty(qty: number): void {
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new RangeError("כמות חייבת להיות מספר שלם חיובי");
    }
  }

  add(sku: string, qty: number): void {
    this.#checkQty(qty);
    this.#items.set(sku, this.count(sku) + qty);
  }

  remove(sku: string, qty: number): void {
    this.#checkQty(qty);
    const have = this.count(sku);
    if (have < qty) {
      throw new Error(`אין מספיק ${sku}: יש ${have}, ביקשו ${qty}`);
    }
    if (have === qty) {
      this.#items.delete(sku);
    } else {
      this.#items.set(sku, have - qty);
    }
  }

  count(sku: string): number {
    return this.#items.get(sku) ?? 0;
  }

  totalItems(): number {
    return [...this.#items.values()].reduce((sum, n) => sum + n, 0);
  }

  skus(): string[] {
    return [...this.#items.keys()].sort();
  }
}

const inv = new Inventory();
inv.add("pen", 5);
inv.add("cup", 2);
inv.remove("cup", 2);
try {
  inv.remove("pen", 9);
} catch (err) {
  console.log((err as Error).message);
}
console.log(inv.count("pen"), inv.totalItems(), inv.skus());
