// P12-E22: repository שדולף, ו־service שיוצר לעצמו תלות
export type Product = { id: number; price: number };

export interface ProductRepo {
  findById(id: number): Promise<Product | null>;
  save(p: Product): Promise<void>;
}

export class MemoryProductRepo implements ProductRepo {
  #items = new Map<number, Product>();
  async findById(id: number) {
    return this.#items.get(id) ?? null;
  }
  async save(p: Product) {
    this.#items.set(p.id, p);
  }
}

export class PricingService {
  #repo: ProductRepo;
  constructor() {
    this.#repo = new MemoryProductRepo();
  }
  async priceWithVat(id: number): Promise<number> {
    const p = await this.#repo.findById(id);
    if (!p) throw new Error(`מוצר ${id} לא נמצא`);
    return Math.round(p.price * 1.18 * 100) / 100;
  }
}
