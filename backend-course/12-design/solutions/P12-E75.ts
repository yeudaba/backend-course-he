// P12-E75: סינון מוצרים מה־URL
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.field = field;
  }
}

type Filters = { minPrice?: number; maxPrice?: number; tags: string[]; inStock: boolean };

export function parseFilters(query: Record<string, string | undefined>): Filters {
  const price = (field: string): number | undefined => {
    const raw = (query[field] ?? "").trim();
    if (raw === "") return undefined;
    if (!/^\d+(\.\d+)?$/.test(raw)) throw new ValidationError(field, `${field} לא תקין`);
    return Number(raw);
  };
  const min = price("minPrice");
  const max = price("maxPrice");
  if (min !== undefined && max !== undefined && min > max) {
    throw new ValidationError("minPrice", "minPrice גדול מ־maxPrice");
  }

  const tags: string[] = [];
  for (const t of (query.tags ?? "").split(",")) {
    const tag = t.trim().toLowerCase();
    if (tag !== "" && !tags.includes(tag)) tags.push(tag);
  }

  const rawStock = query.inStock;
  if (rawStock !== undefined && rawStock !== "true" && rawStock !== "false") {
    throw new ValidationError("inStock", "inStock לא תקין");
  }

  const result: Filters = { tags, inStock: rawStock === "true" };
  if (min !== undefined) result.minPrice = min;
  if (max !== undefined) result.maxPrice = max;
  return result;
}

console.log(parseFilters({ minPrice: "10", tags: "a, B,,c,a", inStock: "true" }));
console.log(parseFilters({}));
try {
  parseFilters({ minPrice: "50", maxPrice: "10" });
} catch (err) {
  console.log(String(err));
}
