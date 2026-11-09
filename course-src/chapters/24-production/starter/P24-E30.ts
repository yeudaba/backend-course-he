// P24-E30: הופך histogram לשורות בפורמט של Prometheus — עם שלוש תקלות
export function renderHistogram({ name, labels, buckets, values }: { name: string; labels: Record<string, string>; buckets: number[]; values: number[] }): string[] {
  const base = Object.entries(labels).map(([k, v]) => `${k}="${v}"`);
  const fmt = (extra?: string) => `{${[...base, ...(extra ? [extra] : [])].join(",")}}`;
  const sorted = [...buckets].sort((a, b) => a - b);
  const counts = sorted.map(() => 0);
  for (const v of values) {
    const i = sorted.findIndex((le) => v <= le);
    if (i !== -1) counts[i]++;
  }
  const lines = sorted.map((le, i) => `${name}_bucket${fmt(`le="${le}"`)} ${counts[i]}`);
  const sum = values.reduce((a, b) => a + b, 0);
  lines.push(`${name}_sum${fmt()} ${sum}`, `${name}_count${fmt()} ${values.length}`);
  return lines;
}
