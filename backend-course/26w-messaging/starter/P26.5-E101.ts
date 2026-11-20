// P26.5-E101: הודעה אחת, at-least-once — כישלון אחד מאבד הזמנה, הזמנות זהות נזרקות, ו־ack על כישלון.
// seen.has(id) ← "duplicate" · handle הצליח ← סימון + "ack" · handle זרק ← "retry" (בלי סימון)
//
// בדיקה:  npm run check P26.5-E101
export type Decision = "ack" | "retry" | "duplicate";

export async function processDelivery(seen: Set<string>, msg: { id: string; body: unknown }, handle: (body: unknown) => Promise<void>): Promise<Decision> {
  const key = JSON.stringify(msg.body);
  if (seen.has(key)) return "duplicate";
  seen.add(key);
  try {
    await handle(msg.body);
  } catch {
    return "ack";
  }
  return "ack";
}
