// P24-E27
// רישום מדדים קטן בפורמט הטקסט של Prometheus: counter ו־histogram, עם labels
type Labels = Record<string, string>;

const escapeValue = (v: string) => v.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
const formatLabels = (names: string[], values: string[], extra = "") => {
  const parts = names.map((n, i) => `${n}="${escapeValue(values[i])}"`);
  if (extra) parts.push(extra);
  return parts.length ? `{${parts.join(",")}}` : "";
};

function labelValues(names: string[], labels: Labels): string[] {
  const keys = Object.keys(labels);
  for (const k of keys) if (!names.includes(k)) throw new Error(`label לא מוכר: ${k}`);
  // כל label חובה — אחרת אותו מדד יופיע פעם עם label ופעם בלי, ואי אפשר לסכם
  return names.map((n) => {
    if (labels[n] === undefined) throw new Error(`חסר label: ${n}`);
    return String(labels[n]);
  });
}

export function createRegistry() {
  const metrics: { render: () => string }[] = [];
  const names = new Set<string>();
  const register = (name: string) => {
    if (names.has(name)) throw new Error(`מדד בשם ${name} כבר רשום`);
    names.add(name);
  };

  function counter({ name, help, labelNames = [] }: { name: string; help: string; labelNames?: string[] }) {
    register(name);
    const series = new Map<string, { values: string[]; value: number }>(); // מפתח: הערכים של ה־labels
    metrics.push({
      render: () =>
        [`# HELP ${name} ${help}`, `# TYPE ${name} counter`, ...[...series.values()].map((s) => `${name}${formatLabels(labelNames, s.values)} ${s.value}`)].join("\n"),
    });
    return {
      inc(labels: Labels = {}, by = 1) {
        if (by < 0) throw new RangeError("counter רק עולה");
        const values = labelValues(labelNames, labels);
        const key = JSON.stringify(values);
        const s = series.get(key) ?? { values, value: 0 };
        s.value += by;
        series.set(key, s);
      },
    };
  }

  function histogram({ name, help, labelNames = [], buckets }: { name: string; help: string; labelNames?: string[]; buckets: number[] }) {
    register(name);
    const sorted = [...buckets].sort((a, b) => a - b);
    const series = new Map<string, { values: string[]; counts: number[]; sum: number; count: number }>();
    metrics.push({
      render: () => {
        const lines = [`# HELP ${name} ${help}`, `# TYPE ${name} histogram`];
        for (const s of series.values()) {
          // הדליים מצטברים: le="0.1" סופר את כל מה שקטן או שווה ל־0.1 — כולל מה שב־le="0.05"
          sorted.forEach((le, i) => lines.push(`${name}_bucket${formatLabels(labelNames, s.values, `le="${le}"`)} ${s.counts[i]}`));
          lines.push(`${name}_bucket${formatLabels(labelNames, s.values, 'le="+Inf"')} ${s.count}`);
          lines.push(`${name}_sum${formatLabels(labelNames, s.values)} ${s.sum}`);
          lines.push(`${name}_count${formatLabels(labelNames, s.values)} ${s.count}`);
        }
        return lines.join("\n");
      },
    });
    return {
      observe(labels: Labels, value: number) {
        const values = labelValues(labelNames, labels);
        const key = JSON.stringify(values);
        const s = series.get(key) ?? { values, counts: sorted.map(() => 0), sum: 0, count: 0 };
        sorted.forEach((le, i) => { if (value <= le) s.counts[i]++; });
        s.sum += value;
        s.count++;
        series.set(key, s);
      },
    };
  }

  return { counter, histogram, metrics: () => metrics.map((m) => m.render()).join("\n") + "\n" };
}
