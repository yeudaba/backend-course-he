// P29-E20: "בחלק מהתשובות מופיע 'undefined', סירוב מוצג כתשובה ריקה, ותשובות חתוכות מוצגות כאילו שלמות" — שלוש תקלות
import type Anthropic from "@anthropic-ai/sdk";

export function replyText(message: Anthropic.Message): string {
  return message.content.map((b) => `${(b as Anthropic.TextBlock).text}`).join("");
}
