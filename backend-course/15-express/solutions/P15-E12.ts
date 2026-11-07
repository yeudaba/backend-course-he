// P15-E12
import { z } from "zod";

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(["price", "-price", "name", "-name"]).optional(),
  inStock: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

console.log(JSON.stringify(listQuerySchema.parse({ page: "3", inStock: "false" })));
console.log(z.coerce.boolean().parse("false"));
