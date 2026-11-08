// P28-E07: אומדן "על גב מעטפה"
export interface Inputs {
  dailyActiveUsers: number;
  requestsPerUserPerDay: number;
  writeRatio: number;
  bytesPerWrite: number;
  peakFactor: number;
  retentionDays: number;
}

export function estimate(i: Inputs): { avgRps: number; peakRps: number; writesPerSecond: number; storageGB: number } {
  throw new Error("עוד לא כתבת את הפתרון");
}
