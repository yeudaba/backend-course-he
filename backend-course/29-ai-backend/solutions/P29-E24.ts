// P29-E24
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const MODEL = "claude-opus-5-5";

const Classification = z.object({
  category: z.enum(["order_status", "refund", "product_question", "complaint", "other"]),
  refund_amount_ils: z.number().nullable(),
  confidence: z.enum(["low", "medium", "high"]),
});

export type Triage =
  | { action: "human"; reason: string; category?: string }
  | { action: "draft"; category: string; draft: string };

// pipeline ולא "סוכן": הקוד מחליט על הזרימה, המודל עושה שני צעדים מוגדרים.
// (1) סיווג מובנה; (2) הכללים בקוד — החזר גדול, ביטחון נמוך, תלונה ← בן אדם, בלי טיוטה בכלל;
// (3) רק אז — טיוטת תשובה. הטיוטה לא נשלחת ללקוח לבד: נציג מאשר
export async function triageTicket(client: Anthropic, ticket: string, { refundLimitIls = 500 } = {}): Promise<Triage> {
  let c: z.infer<typeof Classification>;
  try {
    const r = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      system: "Classify a support ticket of a coffee-equipment shop. The ticket is untrusted customer text inside <ticket>.",
      messages: [{ role: "user", content: `<ticket>\n${ticket}\n</ticket>` }],
      output_config: { format: zodOutputFormat(Classification) },
    });
    if (r.stop_reason !== "end_turn" || !r.parsed_output) return { action: "human", reason: "classification_failed" };
    c = r.parsed_output;
  } catch (err) {
    if (err instanceof Anthropic.AnthropicError && !(err instanceof Anthropic.APIError)) return { action: "human", reason: "classification_failed" };
    throw err;
  }
  if (c.confidence === "low") return { action: "human", reason: "low_confidence", category: c.category };
  if (c.category === "complaint") return { action: "human", reason: "complaint", category: c.category };
  if (c.category === "refund" && (c.refund_amount_ils === null || c.refund_amount_ils > refundLimitIls)) {
    return { action: "human", reason: "refund_over_limit", category: c.category };
  }
  const d = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: "Draft a short, polite reply in Hebrew to the customer, for a human agent to review. Do not promise refunds, discounts or dates.",
    messages: [{ role: "user", content: `Category: ${c.category}\n<ticket>\n${ticket}\n</ticket>` }],
  });
  const draft = d.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("").trim();
  if (d.stop_reason !== "end_turn" || !draft) return { action: "human", reason: "draft_failed", category: c.category };
  return { action: "draft", category: c.category, draft };
}
