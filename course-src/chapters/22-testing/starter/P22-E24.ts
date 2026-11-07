// P22-E24 — הקוד שבודקים (לא משנים אותו)
export interface Clock {
  now(): Date;
}

export interface Notifier {
  lowStock(sku: string, available: number): void;
}

export class OutOfStockError extends Error {}

const HOLD_MS = 15 * 60 * 1000; // שמירה בעגלה — 15 דקות

interface Reservation {
  id: number;
  sku: string;
  qty: number;
  expiresAt: number;
}

export class InventoryService {
  private readonly stock = new Map<string, number>();
  private readonly reservations = new Map<number, Reservation>();
  private nextId = 1;
  private readonly clock: Clock;
  private readonly notifier: Notifier;
  private readonly lowStockThreshold: number;

  constructor(clock: Clock, notifier: Notifier, lowStockThreshold = 3) {
    this.clock = clock;
    this.notifier = notifier;
    this.lowStockThreshold = lowStockThreshold;
  }

  restock(sku: string, qty: number): void {
    if (!Number.isInteger(qty) || qty < 1) throw new RangeError("כמות חייבת להיות שלם חיובי");
    this.stock.set(sku, (this.stock.get(sku) ?? 0) + qty);
  }

  // פנוי = במלאי, פחות שמירות שעוד לא פגו
  available(sku: string): number {
    const now = this.clock.now().getTime();
    let held = 0;
    for (const r of this.reservations.values()) if (r.sku === sku && r.expiresAt > now) held += r.qty;
    return (this.stock.get(sku) ?? 0) - held;
  }

  reserve(sku: string, qty: number): number {
    if (!Number.isInteger(qty) || qty < 1) throw new RangeError("כמות חייבת להיות שלם חיובי");
    const available = this.available(sku);
    if (qty > available) throw new OutOfStockError(`יש רק ${available} של ${sku}`);
    const id = this.nextId++;
    this.reservations.set(id, { id, sku, qty, expiresAt: this.clock.now().getTime() + HOLD_MS });
    const left = available - qty;
    if (left <= this.lowStockThreshold) this.notifier.lowStock(sku, left);
    return id;
  }

  release(id: number): void {
    this.reservations.delete(id);
  }

  // תשלום הצליח: יורד מהמלאי באמת. שמירה שפגה (או לא קיימת) ← שגיאה
  commit(id: number): void {
    const r = this.reservations.get(id);
    if (!r || r.expiresAt <= this.clock.now().getTime()) throw new Error("השמירה לא קיימת או שפג תוקפה");
    this.stock.set(r.sku, (this.stock.get(r.sku) ?? 0) - r.qty);
    this.reservations.delete(id);
  }
}
