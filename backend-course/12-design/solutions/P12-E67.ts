// P12-E67: חיפוש מוצרים עם עמודים
export type Product = { id: number; name: string; price: number };

export interface ProductRepository {
  findAll(): Promise<Product[]>;
}

type Query = { text?: string; minPrice?: number; maxPrice?: number; page?: number; pageSize?: number };

export class SearchService {
  #repo: ProductRepository;

  constructor(repo: ProductRepository) {
    this.#repo = repo;
  }

  async search(q: Query): Promise<{ items: Product[]; total: number }> {
    const { page = 1, pageSize = 10 } = q;
    const text = (q.text ?? "").trim().toLowerCase();
    const list = (await this.#repo.findAll())
      .filter((p) => text === "" || p.name.toLowerCase().includes(text))
      .filter((p) => q.minPrice === undefined || p.price >= q.minPrice)
      .filter((p) => q.maxPrice === undefined || p.price <= q.maxPrice)
      .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
    return { items: list.slice((page - 1) * pageSize, page * pageSize), total: list.length };
  }
}

const repo: ProductRepository = {
  async findAll() {
    return [
      { id: 1, name: "Pen", price: 5 },
      { id: 2, name: "Pencil", price: 3 },
      { id: 3, name: "Notebook", price: 12 },
      { id: 4, name: "Fountain pen", price: 120 },
    ];
  },
};
const service = new SearchService(repo);
service.search({ text: " PEN", maxPrice: 100 }).then((r) => console.log(r));
service.search({ page: 2, pageSize: 3 }).then((r) => console.log(r.items.map((p) => p.name), r.total));
