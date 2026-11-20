// P29-E49: הזמנה מטקסט חופשי — הסכום בקוד
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const Items = z.object({ items: z.array(z.object({ product: z.string(), quantity: z.number().int() })) });

type Result =
  | { ok: true; items: { product: string; quantity: number; priceCents: number }[]; totalCents: number; skipped: { product: string; reason: string }[] }
  | { ok: false; reason: "model_failed" };

export async function extractOrder(client: Anthropic, text: string, catalog: Record<string, number>): Promise<Result> {
  const names = Object.keys(catalog);
  let parsed: z.infer<typeof Items> | null;
  try {
    const r = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      system: `Extract the products and quantities the customer asks for. Use only these product names: ${names.join(" | ")}.`,
      messages: [{ role: "user", content: text }],
      output_config: { format: zodOutputFormat(Items) },
    });
    parsed = r.parsed_output;
  } catch (err) {
    if (err instanceof Anthropic.APIError) throw err;
    return { ok: false, reason: "model_failed" };
  }
  if (!parsed) return { ok: false, reason: "model_failed" };

  const byLower = new Map(names.map((k) => [k.toLowerCase(), k]));
  const items: { product: string; quantity: number; priceCents: number }[] = [];
  const skipped: { product: string; reason: string }[] = [];
  for (const it of parsed.items) {
    const name = byLower.get(it.product.trim().toLowerCase());
    if (!name) skipped.push({ product: it.product, reason: "unknown_product" });
    else if (!(it.quantity > 1 && it.quantity <= 20)) skipped.push({ product: name, reason: "bad_quantity" });
    else items.push({ product: name, quantity: it.quantity, priceCents: catalog[name] });
  }
  const totalCents = items.reduce((s, i) => s + i.quantity * i.priceCents, 0);
  return { ok: true, items, totalCents, skipped };
}
