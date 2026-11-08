import { z } from "zod";

export const createProductSchema = z.strictObject({
  name: z.string().trim().min(1, "שם חובה").max(120),
  description: z.string().trim().max(2000).default(""),
  priceCents: z.number().int("מחיר באגורות — מספר שלם").positive("מחיר חיובי"),
  stock: z.number().int().min(0, "מלאי לא שלילי"),
  category: z.string().trim().min(1).max(50),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().refine((v) => Object.keys(v).length > 0, "צריך לפחות שדה אחד");
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

const SORTS = ["name", "-name", "price", "-price", "newest"] as const;
export const listQuerySchema = z.strictObject({
  q: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  inStock: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  sort: z.enum(SORTS).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListQuery = z.infer<typeof listQuerySchema>;

export const idSchema = z.coerce.number().int().positive();
