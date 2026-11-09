// P24-E30
// הופך histogram לשורות בפורמט של Prometheus
export function renderHistogram({ name, labels, buckets, values }: { name: string; labels: Record<string, string>; buckets: number[]; values: number[] }): string[] {
  const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  const base = Object.entries(labels).map(([k, v]) => `${k}="${esc(v)}"`); // תקלה 2: ערך עם " שבר את השורה
  const fmt = (extra?: string) => `{${[...base, ...(extra ? [extra] : [])].join(",")}}`;
  const sorted = [...buckets].sort((a, b) => a - b);
  const lines = sorted.map((le) => `${name}_bucket${fmt(`le="${le}"`)} ${values.filter((v) => v <= le).length}`); // תקלה 1: מצטבר — כל מה שקטן או שווה
  lines.push(`${name}_bucket${fmt('le="+Inf"')} ${values.length}`); // תקלה 3: +Inf חובה, ושווה ל־count
  const sum = values.reduce((a, b) => a + b, 0);
  lines.push(`${name}_sum${fmt()} ${sum}`, `${name}_count${fmt()} ${values.length}`);
  return lines;
}
