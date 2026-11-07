// P11-E08
export type Product = {
  readonly id: number;
  name: string;
  price: number;
  tags: string[];
  stock?: number;
};

export function createProduct(id: number, name: string, price: number): Product {
  return { id, name, price, tags: [] };
}

export function withDiscount(p: Product, percent: number): Product {
  return { ...p, price: Math.round(p.price * (1 - percent / 100) * 100) / 100 };
}

export function isAvailable(p: Product): boolean {
  return (p.stock ?? 0) > 0;
}

console.log(withDiscount(createProduct(1, "עט", 10), 15), isAvailable({ id: 2, name: "x", price: 1, tags: [] }));
