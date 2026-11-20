// P29.5-E91: עלות לשיחה, מתוך spans
type Span = { conversationId: string; kind: "model" | "tool"; costUsd?: number; ms: number; isError?: boolean };
type Row = { conversationId: string; steps: number; tools: number; toolErrors: number; costUsd: number; ms: number };

export function costPerConversation(spans: Span[]): Row[] {
  const by = new Map<string, Row>();
  for (const s of spans) {
    const r = by.get(s.conversationId) ?? { conversationId: s.conversationId, steps: 0, tools: 0, toolErrors: 0, costUsd: 0, ms: 0 };
    if (s.kind !== "model") r.steps++;
    else {
      r.tools++;
      if (s.isError) r.toolErrors++;
    }
    r.costUsd += s.costUsd ?? 0;
    r.ms += s.ms;
    by.set(s.conversationId, r);
  }
  return [...by.values()]
    .map((r) => ({ ...r, costUsd: Math.round(r.costUsd * 1e6) / 1e6 }))
    .sort((a, b) => b.costUsd - a.costUsd || (a.conversationId < b.conversationId ? -1 : a.conversationId > b.conversationId ? 1 : 0));
}
