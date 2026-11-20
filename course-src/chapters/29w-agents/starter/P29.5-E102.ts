// P29.5-E102: סיכום trace — toolCalls גדול מדי, עלות לא מעוגלת, "האיטי" הוא המהיר, וה־trace משתנה.
// steps · toolCalls · toolErrors · costUsd (6 ספרות) · slowestTool (או null) · spans לא משתנה
//
// בדיקה:  npm run check P29.5-E102
export type Span = { kind: "model"; costUsd: number; ms: number } | { kind: "tool"; name: string; ms: number; isError: boolean };

export function summarizeTrace(spans: Span[]) {
  const sorted = spans.sort((a, b) => a.ms - b.ms);
  const tools = sorted.filter((s): s is Extract<Span, { kind: "tool" }> => s.kind === "tool");
  const models = sorted.filter((s): s is Extract<Span, { kind: "model" }> => s.kind === "model");
  return {
    steps: models.length,
    toolCalls: spans.length,
    toolErrors: tools.filter((t) => t.isError).length,
    costUsd: models.reduce((s, m) => s + m.costUsd, 0),
    slowestTool: tools[0]?.name ?? null,
  };
}
