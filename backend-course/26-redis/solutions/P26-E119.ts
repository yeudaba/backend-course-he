// P26-E119: הודעות WebSocket עם zod
import { z } from "zod";

const schema = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("join"), room: z.string().regex(/^[a-z0-9-]{1,30}$/) }),
  z.strictObject({ type: z.literal("say"), text: z.string().trim().min(1).max(500) }),
  z.strictObject({ type: z.literal("typing") }),
]);
export type ClientMessage = z.infer<typeof schema>;

export function parseClientMessage(raw: string | Buffer): { ok: true; msg: ClientMessage } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(String(raw));
  } catch {
    return { ok: false, error: "JSON לא תקין" };
  }
  const r = schema.safeParse(data);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "הודעה לא תקינה" };
  return { ok: true, msg: r.data };
}
