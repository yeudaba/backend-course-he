// P26.5-E36: handler אידמפוטנטי — גם במקביל
type Msg<T> = { id: string } & T;

export function idempotent<T>(handler: (msg: Msg<T>) => Promise<void>) {
  const done = new Set<string>();
  const running = new Map<string, Promise<void>>();
  return async function handle(msg: Msg<T>): Promise<"handled" | "duplicate"> {
    if (done.has(msg.id)) return "duplicate";
    const inFlight = running.get(msg.id);
    if (inFlight) {
      try {
        await inFlight;
        return "duplicate";
      } catch {
        return handle(msg); // הראשון נכשל — ננסה בעצמנו
      }
    }
    const p = handler(msg);
    running.set(msg.id, p);
    try {
      await p;
      done.add(msg.id);
      return "handled";
    } finally {
      running.delete(msg.id);
    }
  };
}
