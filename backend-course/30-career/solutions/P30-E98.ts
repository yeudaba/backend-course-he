// P30-E98: לפני npm install
type Meta = { createdAt: string; weeklyDownloads: number; repository?: string };

function levenshtein(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

export function packageRisk(name: string, registry: Record<string, Meta>, popular: string[], now: Date): string[] {
  if (!Object.hasOwn(registry, name)) return ["not_found"];
  const m = registry[name];
  const risks: string[] = [];
  if ((now.getTime() - Date.parse(m.createdAt)) / 86_400_000 < 30) risks.push("new");
  if (m.weeklyDownloads < 1000) risks.push("low_downloads");
  if (!m.repository) risks.push("no_repo");
  if (!popular.includes(name)) {
    const near = popular.find((p) => {
      const dist = levenshtein(name, p);
      return dist >= 1 && dist <= 2;
    });
    if (near) risks.push(`typosquat:${near}`);
  }
  return risks;
}
