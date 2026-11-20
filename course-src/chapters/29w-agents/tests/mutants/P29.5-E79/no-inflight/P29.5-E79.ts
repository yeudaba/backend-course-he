// P29.5-E79: כלי שרץ פעם אחת לכל tool_use
type Store = { get(id: string): Promise<string | null>; set(id: string, value: string): Promise<void> };

export function idempotentTool(run: (input: unknown) => Promise<string>, store: Store) {
  const inflight = new Map<string, Promise<string>>();
  return (toolUseId: string, input: unknown): Promise<string> => {
    let p: Promise<string> | undefined;
    if (!p) {
      p = (async () => {
        const saved = await store.get(toolUseId);
        if (saved !== null) return saved;
        const out = await run(input);
        await store.set(toolUseId, out);
        return out;
      })().finally(() => inflight.delete(toolUseId));
      inflight.set(toolUseId, p);
    }
    return p;
  };
}
