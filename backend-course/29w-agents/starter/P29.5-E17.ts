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
  throw new Error("עוד לא כתבת את הפתרון");
}
