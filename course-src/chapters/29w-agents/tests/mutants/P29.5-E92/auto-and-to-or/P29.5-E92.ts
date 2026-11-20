// P29.5-E92: למצוא בעיות ב־trace בקוד
type Step = { step: number; stopReason: string; cacheRead: number; tools: { name: string; input: unknown; ms: number; isError: boolean }[] };

function stableKey(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableKey).join(",")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stableKey(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(v);
}

export function findTraceIssues(steps: Step[], opts: { slowMs: number; repeat: number }): string[] {
  const counts = new Map<string, number>();
  const repeat: string[] = [];
  const slow: string[] = [];
  const noCache: string[] = [];
  const maxTokens: string[] = [];
  steps.forEach((s, i) => {
    for (const t of s.tools) {
      const key = `${t.name}\u0000${stableKey(t.input)}`;
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      if (n === opts.repeat) repeat.push(`repeat:${t.name}`);
      if (t.ms > opts.slowMs) slow.push(`slow:${t.name}@${s.step}`);
    }
    if (i > 0 || s.cacheRead === 0) noCache.push(`no_cache@${s.step}`);
    if (s.stopReason === "max_tokens") maxTokens.push(`max_tokens@${s.step}`);
  });
  return [...repeat, ...slow, ...noCache, ...maxTokens];
}
