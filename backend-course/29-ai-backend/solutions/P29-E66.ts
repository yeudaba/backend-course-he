// P29-E66: שומר על הכלים: תקרה וחזרות
function stable(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable((v as Record<string, unknown>)[k])]));
  }
  return v;
}

export function createToolGuard(limits: { maxTotal: number; maxPerTool: number; maxRepeats: number }) {
  let total = 0;
  const perTool = new Map<string, number>();
  const repeats = new Map<string, number>();
  return (name: string, input: unknown): { ok: true } | { ok: false; reason: "total" | "per_tool" | "repeat" } => {
    const key = name + "\u0000" + JSON.stringify(stable(input));
    if (total >= limits.maxTotal) return { ok: false, reason: "total" };
    if ((perTool.get(name) ?? 0) >= limits.maxPerTool) return { ok: false, reason: "per_tool" };
    if ((repeats.get(key) ?? 0) >= limits.maxRepeats) return { ok: false, reason: "repeat" };
    total++;
    perTool.set(name, (perTool.get(name) ?? 0) + 1);
    repeats.set(key, (repeats.get(key) ?? 0) + 1);
    return { ok: true };
  };
}
