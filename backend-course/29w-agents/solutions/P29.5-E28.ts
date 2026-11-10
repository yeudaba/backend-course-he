// P29.5-E28 — trace כעץ טקסט
export type Span = { id: string; parentId: string | null; name: string; start: number; end: number };

export function renderTrace(spans: Span[]): string {
  const children = new Map<string | null, Span[]>();
  const ids = new Set(spans.map((s) => s.id));
  for (const span of spans) {
    // הורה שלא נמצא ב־trace (נחתך, או עוד לא הגיע) — מציגים את ה־span כשורש
    const parent = span.parentId !== null && ids.has(span.parentId) ? span.parentId : null;
    const list = children.get(parent) ?? [];
    list.push(span);
    children.set(parent, list);
  }
  const lines: string[] = [];
  const walk = (parent: string | null, depth: number) => {
    const list = [...(children.get(parent) ?? [])].sort((a, b) => a.start - b.start || a.name.localeCompare(b.name));
    for (const span of list) {
      lines.push(`${"  ".repeat(depth)}${span.name}`.padEnd(32) + `${span.end - span.start}ms`.padStart(8));
      walk(span.id, depth + 1);
    }
  };
  walk(null, 0);
  return lines.join("\n");
}

console.log(
  renderTrace([
    { id: "t3", parentId: "t2", name: "tool:search_orders", start: 1210, end: 1290 },
    { id: "t1", parentId: null, name: "agent.run", start: 1000, end: 2950 },
    { id: "t2", parentId: "t1", name: "llm.call#1", start: 1005, end: 1200 },
    { id: "t5", parentId: "t1", name: "llm.call#2", start: 1300, end: 2900 },
    { id: "t4", parentId: "t2", name: "tool:get_order", start: 1210, end: 1250 },
    { id: "t9", parentId: "lost", name: "retry", start: 3000, end: 3010 },
  ]),
);
