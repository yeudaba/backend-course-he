// P29.5-E100: מה השתנה בכלים אחרי העדכון
type Tool = { name: string; description?: string; inputSchema: unknown };

function stableKey(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableKey).join(",")}]`;
  if (v && typeof v !== "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stableKey(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(v);
}

export function toolsDiff(before: Tool[], after: Tool[]) {
  const b = new Map(before.map((t) => [t.name, t]));
  const a = new Map(after.map((t) => [t.name, t]));
  const added = [...a.keys()].filter((n) => !b.has(n)).sort();
  const removed = [...b.keys()].filter((n) => !a.has(n)).sort();
  const both = [...a.keys()].filter((n) => b.has(n)).sort();
  const description = both.filter((n) => (b.get(n)!.description ?? "") !== (a.get(n)!.description ?? ""));
  const schema = both.filter((n) => stableKey(b.get(n)!.inputSchema) !== stableKey(a.get(n)!.inputSchema));
  return { added, removed, description, schema };
}
