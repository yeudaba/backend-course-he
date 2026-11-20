// P29.5-E101: קיצור היסטוריה — מתוקן
type Block = { type: string; [k: string]: unknown };
export type Message = { role: "user" | "assistant"; content: string | Block[] };

const size = (ms: Message[]) => ms.reduce((s, m) => s + JSON.stringify(m).length, 0);

export function trimHistory(messages: Message[], maxChars: number): Message[] {
  const out = [...messages];
  while (size(out) > maxChars && out.length > 2) out.splice(1, 1);
  while (out.length > 2 && out[1].role !== "user") out.splice(1, 1);
  return out;
}
