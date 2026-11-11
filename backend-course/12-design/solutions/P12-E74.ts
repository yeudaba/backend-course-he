// P12-E74: עדכון חלקי (PATCH)
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.field = field;
  }
}

export type ProductPatch = { name?: string; price?: number; tags?: string[] };

const ALLOWED = ["name", "price", "tags"];

export function parseProductPatch(input: unknown): ProductPatch {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("body", "גוף הבקשה חייב להיות אובייקט");
  }
  const keys = Object.keys(input);
  for (const key of keys) {
    if (!ALLOWED.includes(key)) throw new ValidationError(key, `שדה לא מוכר: ${key}`);
  }
  if (keys.length === 0) throw new ValidationError("body", "אין מה לעדכן");

  const patch: ProductPatch = {};
  if ("name" in input) {
    if (typeof input.name !== "string" || input.name.trim() === "") throw new ValidationError("name", "name לא תקין");
    patch.name = input.name.trim();
  }
  if ("price" in input) {
    const p = input.price;
    if (typeof p !== "number" || !Number.isFinite(p) || p <= 0 || Math.abs(Math.round(p * 100) - p * 100) > 1e-9) {
      throw new ValidationError("price", "price לא תקין");
    }
    patch.price = p;
  }
  if ("tags" in input) {
    const t = input.tags;
    if (!Array.isArray(t) || !t.every((x) => typeof x === "string" && x.trim() !== "")) {
      throw new ValidationError("tags", "tags לא תקין");
    }
    const tags = t.map((x: string) => x.trim().toLowerCase());
    if (new Set(tags).size !== tags.length) throw new ValidationError("tags", "tags לא תקין");
    patch.tags = tags;
  }
  return patch;
}

console.log(parseProductPatch({ price: 19.9 }));
console.log(parseProductPatch({ name: "  עט כחול ", tags: ["New", " sale"] }));
for (const bad of [{}, { price: 1.999 }, { tags: ["a", "A"] }, { name: "x", stock: 5 }]) {
  try {
    parseProductPatch(bad);
  } catch (err) {
    if (err instanceof ValidationError) console.log(err.field, "←", err.message);
  }
}
