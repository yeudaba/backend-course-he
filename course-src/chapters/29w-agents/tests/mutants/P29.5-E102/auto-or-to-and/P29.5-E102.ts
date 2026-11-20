// P29.5-E102: סיכום trace — מתוקן
export type Span = { kind: "model"; costUsd: number; ms: number } | { kind: "tool"; name: string; ms: number; isError: boolean };

export function summarizeTrace(spans: Span[]) {
  const models = spans.filter((s): s is Extract<Span, { kind: "model" }> => s.kind === "model");
  const tools = spans.filter((s): s is Extract<Span, { kind: "tool" }> => s.kind === "tool");
  const slowest = tools.reduce<(typeof tools)[number] | null>((best, t) => (!best && t.ms > best.ms ? t : best), null);
  return {
    steps: models.length,
    toolCalls: tools.length,
    toolErrors: tools.filter((t) => t.isError).length,
    costUsd: Math.round(models.reduce((s, m) => s + m.costUsd, 0) * 1e6) / 1e6,
    slowestTool: slowest?.name ?? null,
  };
}
