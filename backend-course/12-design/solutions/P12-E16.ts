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

export class OrderService {
  #products: Repo<Product>;
  #orders: Repo<Order>;
  #now: () => Date;

  constructor(deps: { products: Repo<Product>; orders: Repo<Order>; now: () => Date }) {
    this.#products = deps.products;
    this.#orders = deps.orders;
    this.#now = deps.now;
  }

  async placeOrder(userId: number, items: { productId: number; qty: number }[]): Promise<Order> {
    if (items.length === 0) {
      throw new ValidationError("items", "הזמנה ריקה");
    }
    // שלב 1: בדיקות בלבד. כמות לכל מוצר — אותו מוצר בכמה שורות נספר פעם אחת, עם סכום הכמויות
    const wanted = new Map<number, number>();
    for (const { productId, qty } of items) {
      if (!Number.isInteger(qty) || qty < 1) {
        throw new ValidationError("qty", "כמות לא תקינה");
      }
      wanted.set(productId, (wanted.get(productId) ?? 0) + qty);
    }
    const products = new Map<number, Product>();
    for (const [productId, qty] of wanted) {
      const product = await this.#products.findById(productId);
      if (!product) {
        throw new NotFoundError(`מוצר ${productId} לא נמצא`);
      }
      if (product.stock < qty) {
        throw new ConflictError(`אין מספיק מלאי למוצר ${productId}`);
      }
      products.set(productId, product);
    }

    // שלב 2: רק אחרי שהכול תקין — מורידים מלאי ושומרים
    const lines: OrderLine[] = items.map((item) => ({ ...item, unitPrice: products.get(item.productId)!.price }));
    for (const [productId, qty] of wanted) {
      const product = products.get(productId)!;
      await this.#products.save({ ...product, stock: product.stock - qty });
    }
    const total = Math.round(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0) * 100) / 100;
    const order: Order = { id: (await this.#orders.count()) + 1, userId, createdAt: this.#now(), lines, total };
    await this.#orders.save(order);
    return order;
  }
}

const products = new MemoryRepo<Product>();
await products.save({ id: 1, name: "עט", price: 5, stock: 10 });
const service = new OrderService({ products, orders: new MemoryRepo<Order>(), now: () => new Date("2026-11-01T10:00:00Z") });
const order = await service.placeOrder(7, [{ productId: 1, qty: 3 }]);
console.log(order.total, order.lines[0].unitPrice, (await products.findById(1))?.stock);
