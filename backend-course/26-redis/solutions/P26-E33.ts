// P26-E33 — TypedEmitter: אירועים עם טיפוסים
type Listener<T> = (payload: T) => void;

export class TypedEmitter<Events extends Record<string, unknown>> {
  #listeners = new Map<keyof Events, Set<Listener<any>>>();

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    let set = this.#listeners.get(event);
    if (!set) {
      set = new Set();
      this.#listeners.set(event, set);
    }
    set.add(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    const set = this.#listeners.get(event);
    if (!set) return;
    set.delete(listener);
    if (set.size === 0) this.#listeners.delete(event);
  }

  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const wrapper: Listener<Events[K]> = (payload) => {
      this.off(event, wrapper);
      listener(payload);
    };
    return this.on(event, wrapper);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): number {
    const set = this.#listeners.get(event);
    if (!set) return 0;
    const listeners = [...set];
    for (const listener of listeners) listener(payload);
    return listeners.length;
  }

  listenerCount(event: keyof Events): number {
    return this.#listeners.get(event)?.size ?? 0;
  }
}

type ShopEvents = {
  "order.paid": { orderId: number; totalCents: number };
  "stock.low": { productId: number; left: number };
};

const bus = new TypedEmitter<ShopEvents>();
const stop = bus.on("order.paid", (e) => console.log(`הזמנה ${e.orderId}: ${(e.totalCents / 100).toFixed(2)} ₪`));
bus.once("stock.low", (e) => console.log(`מלאי נמוך: מוצר ${e.productId}, נשארו ${e.left}`));
console.log(bus.emit("order.paid", { orderId: 17, totalCents: 27890 }));
console.log(bus.emit("stock.low", { productId: 3, left: 2 }), bus.emit("stock.low", { productId: 3, left: 1 }));
stop();
console.log(bus.emit("order.paid", { orderId: 18, totalCents: 100 }), bus.listenerCount("order.paid"));
