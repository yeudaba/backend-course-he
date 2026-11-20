// P29-E90: fetch מדומה לפי תסריט
type Reply = Record<string, unknown> | { error: number; message?: string };

export function scriptedFetch(replies: Reply[]) {
  const bodies: unknown[] = [];
  let i = 0;
  const fetch = async (_url: string | URL | Request, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body)));
    const reply = replies[i++];
    if (reply === undefined) throw new Error(`scriptedFetch: קריאה מספר ${i} — לא היה תסריט בשבילה`);
    if ("error" in reply && typeof reply.error !== "number") {
      return Response.json({ type: "error", error: { type: "api_error", message: reply.message ?? "scripted error" } }, { status: reply.error });
    }
    return Response.json(reply);
  };
  return { fetch: fetch as typeof globalThis.fetch, bodies };
}
