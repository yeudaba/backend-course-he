// P29-E09: classifyTicket — סיווג פנייה עם structured output
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const MODEL = "claude-opus-5-5";

export const Ticket = z.object({
  category: z.enum(["order_status", "refund", "product_question", "complaint", "other"]),
  urgency: z.enum(["low", "normal", "high"]),
  summary: z.string(),
});
export type Ticket = z.infer<typeof Ticket>;

export async function classifyTicket(client: Anthropic, text: string): Promise<Ticket & { needsHuman: boolean }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
