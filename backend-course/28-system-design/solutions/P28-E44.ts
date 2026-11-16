// P28-E44: שיא מתוך לוגים של JSON
export function trafficFromLogs(lines: string[]) {
  const perMinute = new Map<number, number>();
  let skipped = 0;
  let total = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const line of lines) {
    let ms = NaN;
    try {
      const rec = JSON.parse(line);
      if (typeof rec?.time === "string") ms = Date.parse(rec.time);
    } catch {
      // לא JSON
    }
    if (Number.isNaN(ms)) {
      skipped++;
      continue;
    }
    const minute = Math.floor(ms / 60_000);
    perMinute.set(minute, (perMinute.get(minute) ?? 0) + 1);
    total++;
    min = Math.min(min, minute);
    max = Math.max(max, minute);
  }
  if (total === 0) return { total: 0, skipped, minutes: 0, avgPerMinute: 0, peakPerMinute: 0, peakFactor: 0 };
  const minutes = max - min + 1;
  const avg = total / minutes;
  const peak = Math.max(...perMinute.values());
  return { total, skipped, minutes, avgPerMinute: Math.round(avg * 10) / 10, peakPerMinute: peak, peakFactor: Math.round((peak / avg) * 10) / 10 };
}
