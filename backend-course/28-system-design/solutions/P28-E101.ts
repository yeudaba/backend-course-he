// P28-E101: אומדן גב־המעטפה — מתוקן
const round1 = (x: number) => Math.round(x * 10) / 10;

export function estimate({ dau, actionsPerUser, peakFactor, bytesPerAction, retentionDays }: { dau: number; actionsPerUser: number; peakFactor: number; bytesPerAction: number; retentionDays: number }) {
  const perDay = dau * actionsPerUser;
  const avg = perDay / 86_400;
  return {
    avgRps: round1(avg),
    peakRps: round1(avg * peakFactor),
    storageGB: round1((perDay * bytesPerAction * retentionDays) / 1e9),
  };
}
