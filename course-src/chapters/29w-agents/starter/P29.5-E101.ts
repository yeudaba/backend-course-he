// P29.5-E101: קיצור היסטוריה — הסוכן שוכח את האחרון, 400 על tool_result יתום, והמערך של ה־caller משתנה.
// הראשונה נשארת · מוחקים את הישנות אחריה עד ≤ maxChars · השנייה חייבת להיות assistant · בלי לשנות את הקלט
//
// בדיקה:  npm run check P29.5-E101
type Block = { type: string; [k: string]: unknown };
export type Message = { role: "user" | "assistant"; content: string | Block[] };

const size = (ms: Message[]) => ms.reduce((s, m) => s + JSON.stringify(m).length, 0);

export function trimHistory(messages: Message[], maxChars: number): Message[] {
  const out = messages;
  while (size(out) > maxChars && out.length > 2) out.pop();
  return out;
}
