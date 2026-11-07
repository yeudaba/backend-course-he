// P12-E08
export type CartLine = { sku: string; price: number; qty: number };

export class ShoppingCart {
  #lines = new Map<string, CartLine>();

  add(sku: string, price: number, qty = 1): void {
    if (qty <= 0 || price <= 0) {
      throw new Error("כמות ומחיר חייבים להיות חיוביים");
    }
    const existing = this.#lines.get(sku);
    this.#lines.set(sku, { sku, price, qty: (existing?.qty ?? 0) + qty });
  }

  remove(sku: string): boolean {
    return this.#lines.delete(sku);
  }

  get total(): number {
    let sum = 0;
    for (const l of this.#lines.values()) {
      sum += l.price * l.qty;
    }
    return Math.round(sum * 100) / 100;
  }

  get itemCount(): number {
    let n = 0;
    for (const l of this.#lines.values()) {
      n += l.qty;
    }
    return n;
  }

  items(): CartLine[] {
    return [...this.#lines.values()].map((l) => ({ ...l }));
  }
}

const cart = new ShoppingCart();
cart.add("A", 2.5, 2);
cart.add("A", 2.5);
cart.add("B", 10);
console.log(cart.total, cart.itemCount, cart.items().length);
