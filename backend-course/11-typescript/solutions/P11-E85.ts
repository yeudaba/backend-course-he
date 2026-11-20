// P11-E85: מיון לפי שדה מה־URL
export type Product = { id: number; name: string; price: number; stock: number };

const SORTABLE: (keyof Product)[] = ["name", "price", "stock"];

export function sortProducts(products: Product[], sort: string): Product[] {
  const desc = sort.startsWith("-");
  const name = desc ? sort.slice(1) : sort;
  const field = SORTABLE.find((f) => f === name);
  if (field === undefined) {
    throw new Error("שדה מיון לא מוכר: " + sort);
  }
  const dir = desc ? -1 : 1;
  return [...products].sort((a, b) => (a[field] < b[field] ? -dir : a[field] > b[field] ? dir : 0));
}

const products: Product[] = [
  { id: 1, name: "מקלדת", price: 200, stock: 3 },
  { id: 2, name: "עכבר", price: 90, stock: 12 },
  { id: 3, name: "כבל", price: 25, stock: 40 },
];
console.log(sortProducts(products, "price").map((p) => p.id));
console.log(sortProducts(products, "-stock").map((p) => p.id));
try {
  sortProducts(products, "id");
} catch (err) {
  console.log(err instanceof Error ? err.message : err);
}
