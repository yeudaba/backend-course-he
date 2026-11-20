// P26.5-E101: הודעה אחת, at-least-once — מתוקן
export type Decision = "ack" | "retry" | "duplicate";

export async function processDelivery(seen: Set<string>, msg: { id: string; body: unknown }, handle: (body: unknown) => Promise<void>): Promise<Decision> {
  if (seen.has(msg.id)) return "duplicate";
  seen.add(msg.id);
  try {
    await handle(msg.body);
  } catch {
    return "retry";
  }
  return "ack";
}
