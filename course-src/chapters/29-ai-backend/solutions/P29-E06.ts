// P29-E06
import type Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

export type AskResult = { ok: true; text: string } | { ok: false; reason: "refusal" | "max_tokens" | "empty" };

// שאלה אחת ← תשובה. שלושה דברים שכל קריאה צריכה: לבדוק stop_reason לפני שקוראים את התוכן,
// לאסוף רק בלוקים מסוג text (יש גם thinking, tool_use…), ולא להניח ש־content[0] הוא הטקסט
export async function ask(client: Anthropic, question: string, { system }: { system?: string } = {}): Promise<AskResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: question }],
  });
  if (response.stop_reason === "refusal") return { ok: false, reason: "refusal" };
  if (response.stop_reason === "max_tokens") return { ok: false, reason: "max_tokens" }; // תשובה חתוכה באמצע — לא מציגים כאילו שלמה
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return text ? { ok: true, text } : { ok: false, reason: "empty" };
}
