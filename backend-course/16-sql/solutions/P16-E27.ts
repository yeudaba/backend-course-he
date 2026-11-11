// P16-E27: בונה שאילתות עם פרמטרים
export type ProductFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  sort?: "price" | "-price" | "name";
  limit?: number;
};

export function buildProductQuery(filters: ProductFilters): { text: string; values: unknown[] } {
  const conditions = ["is_active"];
  const values: unknown[] = [];
  const param = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (filters.category !== undefined) conditions.push(`category = ${param(filters.category)}`);
  if (filters.minPrice !== undefined) conditions.push(`price >= ${param(filters.minPrice)}`);
  if (filters.maxPrice !== undefined) conditions.push(`price <= ${param(filters.maxPrice)}`);
  if (filters.search !== undefined) conditions.push(`name ILIKE ${param(`%${filters.search}%`)}`);
  if (filters.inStock === true) conditions.push("stock > 0");
  if (filters.inStock === false) conditions.push("stock = 0");

  let orderBy: string;
  switch (filters.sort) {
    case "price":
      orderBy = "price, id";
      break;
    case "-price":
      orderBy = "price DESC, id";
      break;
    case "name":
      orderBy = "name";
      break;
    case undefined:
      orderBy = "id";
      break;
    default:
      throw new Error(`מיון לא מוכר: ${filters.sort}`);
  }

  let text = `SELECT id, name, price FROM products WHERE ${conditions.join(" AND ")} ORDER BY ${orderBy}`;
  if (filters.limit !== undefined) text += ` LIMIT ${param(filters.limit)}`;
  return { text, values };
}

console.log(buildProductQuery({}));
console.log(buildProductQuery({ category: "beans", maxPrice: 90, inStock: true, sort: "-price", limit: 2 }));
console.log(buildProductQuery({ search: "grinder", sort: "name" }));
