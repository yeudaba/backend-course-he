// P12-E13
export class Inventory {
  #stock = new Map<string, number>();
  #reserved = new Map<string, number>();

  #assertQty(qty: number): void {
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error("כמות לא תקינה");
    }
  }

  addStock(sku: string, qty: number): void {
    this.#assertQty(qty);
    this.#stock.set(sku, (this.#stock.get(sku) ?? 0) + qty);
  }

  available(sku: string): number {
    return (this.#stock.get(sku) ?? 0) - (this.#reserved.get(sku) ?? 0);
  }

  reserve(sku: string, qty: number): void {
    this.#assertQty(qty);
    if (this.available(sku) < qty) {
      throw new Error(`אין מספיק מלאי של ${sku}`);
    }
    this.#reserved.set(sku, (this.#reserved.get(sku) ?? 0) + qty);
  }

  release(sku: string, qty: number): void {
    this.#assertQty(qty);
    const reserved = this.#reserved.get(sku) ?? 0;
    if (qty > reserved) {
      throw new Error("שחרור גדול מהשריון");
    }
    this.#reserved.set(sku, reserved - qty);
  }

  commit(sku: string, qty: number): void {
    this.release(sku, qty);
    this.#stock.set(sku, (this.#stock.get(sku) ?? 0) - qty);
  }
}

const inv = new Inventory();
inv.addStock("A", 5);
inv.reserve("A", 3);
inv.commit("A", 2);
console.log(inv.available("A"));
