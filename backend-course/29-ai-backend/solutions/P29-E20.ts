// P29-E20
import type Anthropic from "@anthropic-ai/sdk";

export function replyText(message: Anthropic.Message): string {
  // תקלה 2: סירוב לא נבדק ← הלקוח קיבל תשובה ריקה בלי הסבר (או מה שהספיק להיכתב לפני הסירוב)
  if (message.stop_reason === "refusal") throw new Error("המודל סירב לענות");
  // תקלה 3: max_tokens לא נבדק ← חצי תשובה הוצגה כאילו היא שלמה
  if (message.stop_reason === "max_tokens") throw new Error("התשובה נחתכה (max_tokens)");
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text") // תקלה 1: בלי filter, `${b.text}` של thinking או tool_use הוא המחרוזת "undefined"
    .map((b) => b.text)
    .join("");
}
