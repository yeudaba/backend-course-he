// P26-E50: מפתח cache יציב
type Value = string | number | boolean | string[] | null | undefined;

export function cacheKey(group: string, params: Record<string, Value>): string {
  const entries: [string, unknown][] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string") {
      if (v.trim() === "") continue;
      entries.push([k, v.trim()]);
    } else if (Array.isArray(v)) {
      if (v.length === 0) continue;
      entries.push([k, [...v].sort()]);
    } else entries.push([k, v]);
  }
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `${group}:${JSON.stringify(Object.fromEntries(entries))}`;
}
