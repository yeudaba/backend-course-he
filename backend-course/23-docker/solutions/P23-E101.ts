// P23-E101: מדיניות שמירה — יומיים ושבועיים
const RE = /^[\w-]+-(\d{4})-(\d{2})-(\d{2})\.sql\.gz$/;
const dayNumber = (y: string, m: string, d: string) => Date.UTC(Number(y), Number(m) - 1, Number(d)) / 86_400_000;

export function toDelete(files: string[], today: string, { daily = 7, weekly = 4 }: { daily?: number; weekly?: number } = {}): string[] {
  const [ty, tm, td] = today.split("-");
  const todayN = dayNumber(ty, tm, td);
  const backups = files
    .map((f) => ({ f, m: RE.exec(f) }))
    .filter((x) => x.m)
    .map(({ f, m }) => ({ f, age: todayN - dayNumber(m![1], m![2], m![3]) }));
  const keep = new Set<string>();
  const newestInWeek = new Map<number, { f: string; age: number }>();
  for (const b of backups) {
    if (b.age < daily) {
      keep.add(b.f);
      continue;
    }
    const week = Math.floor((b.age - daily) / 7);
    if (week >= weekly) continue;
    const cur = newestInWeek.get(week);
    if (!cur || b.age < cur.age) newestInWeek.set(week, b);
  }
  for (const b of newestInWeek.values()) keep.add(b.f);
  return backups
    .filter((b) => !keep.has(b.f))
    .sort((a, b) => b.age - a.age)
    .map((b) => b.f);
}
