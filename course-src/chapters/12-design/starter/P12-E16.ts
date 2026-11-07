// P12-E16
export type Product = { id: number; name: string; price: number; stock: number };
export type OrderLine = { productId: number; qty: number; unitPrice: number };
export type Order = { id: number; userId: number; createdAt: Date; lines: OrderLine[]; total: number };

export interface Repo<T extends { id: number }> {
  findById(id: number): Promise<T | null>;
  save(item: T): Promise<void>;
  count(): Promise<number>;
}

export class MemoryRepo<T extends { id: number }> implements Repo<T> {
  #items = new Map<number, T>();
  async findById(id: number) {
    const x = this.#items.get(id);
    return x ? structuredClone(x) : null;
  }
  async save(item: T) {
    this.#items.set(item.id, structuredClone(item));
  }
  async count() {
    return this.#items.size;
  }
}

export class NotFoundError extends Error {}
export class ConflictError extends Error {}
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}

// constructor({ products, orders, now })
// placeOrder(userId, items: { productId, qty }[]):
//   ריק → ValidationError("items", "הזמנה ריקה")
//   מוצר לא קיים → NotFoundError(`מוצר ${id} לא נמצא`) | חסר מלאי → ConflictError(`אין מספיק מלאי למוצר ${id}`)
//   הכול או כלום; שומר { id: count+1, userId, createdAt: now(), lines (עם unitPrice ברגע ההזמנה), total }
export class OrderService {
  // כתוב כאן
}
