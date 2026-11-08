// P29-E24: triageTicket — סיווג, כללים בקוד, ורק אז טיוטה
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const MODEL = "claude-opus-5-5";

export type Triage =
  | { action: "human"; reason: string; category?: string }
  | { action: "draft"; category: string; draft: string };

export async function triageTicket(client: Anthropic, ticket: string, options: { refundLimitIls?: number } = {}): Promise<Triage> {
  throw new Error("עוד לא כתבת את הפתרון");
}
