// P15-E12
import { z } from "zod";

// page ≥ 1 (1) | limit 1–50 (10) | sort: price/-price/name/-name | inStock: "true"/"false" → boolean
export const listQuerySchema = z.object({
  // כתוב כאן
});

export type ListQuery = z.infer<typeof listQuerySchema>;
