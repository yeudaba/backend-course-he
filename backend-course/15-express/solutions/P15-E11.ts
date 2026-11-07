// P15-E11
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "לפחות 2 תווים").max(80, "עד 80 תווים"),
  price: z.number().positive("חייב להיות חיובי").max(100_000, "יקר מדי"),
  tags: z.array(z.string()).max(5, "עד 5 תגיות").default([]),
  inStock: z.boolean().default(true),
});

export type Product = z.infer<typeof productSchema>;

export function parseProduct(input: unknown) {
  const result = productSchema.safeParse(input);
  if (result.success) return { ok: true as const, data: result.data };
  return {
    ok: false as const,
    errors: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  };
}

console.log(JSON.stringify(parseProduct({ name: " מסך ", price: 899 })));
console.log(JSON.stringify(parseProduct({ name: "x", price: -1, tags: ["a", "b", 3] })));
