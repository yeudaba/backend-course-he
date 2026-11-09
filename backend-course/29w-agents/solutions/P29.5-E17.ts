// P29.5-E17: קריאה עם מדיניות — fallback בצד השרת, ושגיאות ברורות על refusal ועל תשובה חתוכה
import Anthropic from "@anthropic-ai/sdk";

export class RefusalError extends Error {
  category: string | null;
  constructor(category: string | null) {
    super(`המודל סירב (${category ?? "ללא קטגוריה"})`);
    this.category = category;
  }
}
export class TruncatedError extends Error {
  constructor() {
    super("התשובה נחתכה ב־max_tokens");
  }
}

export async function createWithPolicy(client: Anthropic, params: Record<string, any>): Promise<Anthropic.Message> {
  const res = (await client.beta.messages.create({
    ...params,
    betas: [...(params.betas ?? []), "server-side-fallback-2026-07-01"],
    fallbacks: "default", // אם המודל מסרב, השרת מנתב למודל אחר לפי קטגוריית הסירוב
  } as any)) as any;
  if (res.stop_reason === "refusal") throw new RefusalError(res.stop_details?.category ?? null);
  if (res.stop_reason === "max_tokens") throw new TruncatedError();
  return res as Anthropic.Message;
}
