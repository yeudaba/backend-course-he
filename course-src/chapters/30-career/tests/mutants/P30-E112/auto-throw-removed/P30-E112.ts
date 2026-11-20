// P30-E112: משפך לפי שבוע
type App = { company: string; appliedOn: string; stage: "applied" | "screen" | "interview" | "offer" | "rejected" };

function mondayOf(dateStr: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) throw new RangeError(`תאריך לא תקין: ${dateStr}`);
  const d = new Date(dateStr + "T00:00:00Z");

  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export function weeklyFunnel(apps: App[]) {
  const weeks = new Map<string, { week: string; applied: number; responded: number; interviews: number }>();
  for (const a of apps) {
    const week = mondayOf(a.appliedOn);
    const w = weeks.get(week) ?? { week, applied: 0, responded: 0, interviews: 0 };
    w.applied++;
    if (a.stage !== "applied") w.responded++;
    if (a.stage === "interview" || a.stage === "offer") w.interviews++;
    weeks.set(week, w);
  }
  return [...weeks.values()].sort((x, y) => (x.week < y.week ? -1 : 1));
}
