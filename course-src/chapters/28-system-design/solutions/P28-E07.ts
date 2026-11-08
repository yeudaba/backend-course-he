// P28-E07
// "חישוב על גב מעטפה": מסדרי גודל, לא דיוק. יום = 86,400 שניות ≈ 100,000
export interface Inputs {
  dailyActiveUsers: number;
  requestsPerUserPerDay: number;
  writeRatio: number; // חלק הבקשות שכותבות (0..1)
  bytesPerWrite: number;
  peakFactor: number; // השיא פי כמה מהממוצע
  retentionDays: number;
}

export function estimate(i: Inputs) {
  const perDay = i.dailyActiveUsers * i.requestsPerUserPerDay;
  const avgRps = perDay / 86_400;
  const writesPerDay = perDay * i.writeRatio;
  const storageBytes = writesPerDay * i.bytesPerWrite * i.retentionDays;
  return {
    avgRps: Math.round(avgRps),
    peakRps: Math.round(avgRps * i.peakFactor),
    writesPerSecond: Math.round(writesPerDay / 86_400),
    storageGB: Math.round(storageBytes / 1e9),
  };
}
