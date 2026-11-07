// P12-E22: מתוקן
export type Product = { id: number; price: number };

export interface ProductRepo {
  findById(id: number): Promise<Product | null>;
  save(p: Product): Promise<void>;
}

export class MemoryProductRepo implements ProductRepo {
  #items = new Map<number, Product>();
  async findById(id: number) {
    const p = this.#items.get(id);
    return p ? { ...p } : null;
  }
  async save(p: Product) {
    this.#items.set(p.id, { ...p });
  }
}

export class PricingService {
  #repo: ProductRepo;
  constructor(repo: ProductRepo) {
    this.#repo = repo;
  }
  async priceWithVat(id: number): Promise<number> {
    const p = await this.#repo.findById(id);
    if (!p) throw new Error(`מוצר ${id} לא נמצא`);
    return Math.round(p.price * 1.18 * 100) / 100;
  }
}

const repo = new MemoryProductRepo();
await repo.save({ id: 1, price: 100 });
const p = await repo.findById(1);
if (p) p.price = 1;
console.log(await new PricingService(repo).priceWithVat(1));
