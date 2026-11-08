// P29-E12
import Anthropic from "@anthropic-ai/sdk";

// ה־SDK כבר מנסה שוב לבד (maxRetries, ברירת מחדל 2) על 408/409/429/5xx. מה שנשאר לנו: מה עושים אחרי שגם זה נכשל.
// עומס או תקלה אצל הספק (5xx, 529 overloaded) ← מודל חלופי. בקשה שגויה (4xx) — אותה בקשה תיכשל גם שם ← זורקים
export async function createWithFallback(
  client: Anthropic,
  params: Anthropic.MessageCreateParamsNonStreaming,
  fallbackModel: string,
): Promise<{ message: Anthropic.Message; usedFallback: boolean }> {
  try {
    return { message: await client.messages.create(params), usedFallback: false };
  } catch (err) {
    const overloaded = err instanceof Anthropic.InternalServerError || (err instanceof Anthropic.APIError && (err.status ?? 0) >= 500);
    if (!overloaded || params.model === fallbackModel) throw err;
    return { message: await client.messages.create({ ...params, model: fallbackModel }), usedFallback: true };
  }
}
