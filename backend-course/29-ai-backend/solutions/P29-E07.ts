// P29-E07
import type Anthropic from "@anthropic-ai/sdk";

export interface Turn {
  role: "user" | "assistant";
  text: string;
}

// ה־API לא זוכר כלום: כל בקשה שולחת את כל השיחה. כדי לא לשלם על שיחה אינסופית — שומרים רק את maxTurns
// הזוגות האחרונים. ההודעה הראשונה חייבת להיות user, וההיסטוריה לא נגמרת בשאלה פתוחה
export function buildMessages(history: readonly Turn[], question: string, maxTurns = 5): Anthropic.MessageParam[] {
  const clean = history.filter((t) => t.text.trim() !== "");
  let recent = clean.slice(-maxTurns * 2);
  while (recent.length > 0 && recent[0].role !== "user") recent = recent.slice(1);
  if (recent.length > 0 && recent[recent.length - 1].role === "user") recent = recent.slice(0, -1); // שאלה בלי תשובה (נכשלה) — לא שולחים שוב
  return [...recent.map((t) => ({ role: t.role, content: t.text })), { role: "user", content: question }];
}
