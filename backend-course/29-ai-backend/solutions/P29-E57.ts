// P29-E57: לסווג פעם אחת לכל פנייה
type Saved = { category: string; urgency: string; promptVersion: string };
type Deps = {
  classify(text: string): Promise<{ category: string; urgency: string }>;
  repo: { get(ticketId: string): Promise<Saved | null>; save(ticketId: string, v: Saved): Promise<boolean> };
  promptVersion: string;
};

export function createClassifier(deps: Deps) {
  const inflight = new Map<string, Promise<Saved & { cached: boolean }>>();

  async function run(ticketId: string, text: string): Promise<Saved & { cached: boolean }> {
    const existing = await deps.repo.get(ticketId);
    if (existing && existing.promptVersion === deps.promptVersion) return { ...existing, cached: true };
    const c = await deps.classify(text);
    const value: Saved = { category: c.category, urgency: c.urgency, promptVersion: deps.promptVersion };
    if (await deps.repo.save(ticketId, value)) return { ...value, cached: false };
    const winner = await deps.repo.get(ticketId);
    return { ...(winner ?? value), cached: false };
  }

  return (ticketId: string, text: string) => {
    let p = inflight.get(ticketId);
    if (!p) {
      p = run(ticketId, text).finally(() => inflight.delete(ticketId));
      inflight.set(ticketId, p);
    }
    return p;
  };
}
