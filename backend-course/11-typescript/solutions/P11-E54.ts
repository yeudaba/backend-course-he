// P11-E54: מחירון במקביל — עם טיפוסים
export type Product = { id: number; name: string; price: number };

export async function loadProducts(ids: number[], getOne: (id: number) => Promise<Product>): Promise<Product[]> {
  return Promise.all(ids.map((id) => getOne(id)));
}

export async function cheapest(ids: number[], getOne: (id: number) => Promise<Product>): Promise<Product | null> {
  const products = await loadProducts(ids, getOne);
  let best: Product | null = null;
  for (const p of products) {
    if (best === null || p.price < best.price) best = p;
  }
  return best;
}

const db: Product[] = [
  { id: 1, name: "עט", price: 5 },
  { id: 2, name: "מחברת", price: 12 },
  { id: 3, name: "מחק", price: 3 },
];
const getOne = async (id: number): Promise<Product> => {
  const p = db.find((x) => x.id === id);
  if (!p) throw new Error(`אין מוצר ${id}`);
  return p;
};

async function demo() {
  console.log((await loadProducts([2, 1], getOne)).map((p) => p.name));
  console.log((await cheapest([1, 2, 3], getOne))?.name, await cheapest([], getOne));
}
demo();
