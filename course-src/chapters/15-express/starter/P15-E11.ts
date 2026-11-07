// P15-E11
import { z } from "zod";

// name 2–80 (אחרי trim) | price חיובי עד 100,000 | tags עד 5, ברירת מחדל [] | inStock ברירת מחדל true
export const productSchema = z.object({
  // כתוב כאן
});

export type Product = z.infer<typeof productSchema>;

// → { ok: true, data } | { ok: false, errors: [{ path: "tags.2", message }] }
export function parseProduct(input: unknown) {
  // כתוב כאן
}
