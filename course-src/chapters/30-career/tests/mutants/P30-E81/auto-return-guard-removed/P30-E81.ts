// P30-E81: המספרים של תקלה, מתוך הלוגים
type Incident = { errors: number; firstErrorAt: string | null; lastErrorAt: string | null; minutes: number; peakPerMinute: number; fixedBy: string | null };

export function incidentNumbers(lines: string[]): Incident {
  const errors: number[] = [];
  const deploys: { time: number; version: string }[] = [];
  for (const line of lines) {
    let o: any;
    try {
      o = JSON.parse(line);
    } catch {
      continue;
    }
    if (!o || typeof o.time !== "number") continue;
    if (o.level >= 50) errors.push(o.time);
    if (o.msg === "deploy") deploys.push({ time: o.time, version: String(o.version) });
  }

  const first = Math.min(...errors);
  const last = Math.max(...errors);
  const perMinute = new Map<number, number>();
  for (const t of errors) perMinute.set(Math.floor(t / 60000), (perMinute.get(Math.floor(t / 60000)) ?? 0) + 1);
  const fix = deploys.find((d) => d.time >= first && d.time <= last);
  return {
    errors: errors.length,
    firstErrorAt: new Date(first).toISOString(),
    lastErrorAt: new Date(last).toISOString(),
    minutes: Math.ceil((last - first) / 60000),
    peakPerMinute: Math.max(...perMinute.values()),
    fixedBy: fix ? fix.version : null,
  };
}
