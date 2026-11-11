// P25.7-E26 — חיפוש מוצרים מ־query string
import type { Db } from "mongodb";

type Query = Record<string, string | undefined>;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function price(value: string, name: string): number {
  const n = Number(value);
  if (value.trim() === "" || !Number.isFinite(n) || n < 0) throw new RangeError(`${name} לא תקין: ${value}`);
  return n;
}

export function buildProductFilter(query: Query): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (query.q) filter.name = { $regex: escapeRegex(query.q.trim()), $options: "i" };
  if (query.category) filter.category = query.category;

  const range: Record<string, number> = {};
  if (query.minPrice !== undefined) range.$gte = price(query.minPrice, "minPrice");
  if (query.maxPrice !== undefined) range.$lte = price(query.maxPrice, "maxPrice");
  if (range.$gte !== undefined && range.$lte !== undefined && range.$gte > range.$lte) throw new RangeError("minPrice גדול מ־maxPrice");
  if (Object.keys(range).length > 0) filter.price = range;

  if (query.tags) {
    const tags = query.tags.split(",").map((t) => t.trim()).filter((t) => t !== "");
    if (tags.length > 0) filter.tags = { $all: tags };
  }

  switch (query.inStock) {
    case undefined:
      break;
    case "true":
      filter.stock = { $gt: 0 };
      break;
    case "false":
      filter.stock = 0;
      break;
    default:
      throw new RangeError(`inStock חייב להיות true או false: ${query.inStock}`);
  }
  return filter;
}

export async function searchProducts(db: Db, query: Query): Promise<string[]> {
  const docs = await db.collection("products").find(buildProductFilter(query)).sort({ name: 1 }).project({ _id: 0, name: 1 }).toArray();
  return docs.map((d) => d.name);
}

console.log(JSON.stringify(buildProductFilter({ q: " v60 (ceramic) ", minPrice: "50", tags: "pour-over, ", inStock: "true", sort: "x" })));
console.log(JSON.stringify(buildProductFilter({ category: "beans", maxPrice: "55", inStock: "false" })));
try {
  buildProductFilter({ minPrice: "100", maxPrice: "50" });
} catch (err) {
  console.log((err as Error).name, (err as Error).message);
}
