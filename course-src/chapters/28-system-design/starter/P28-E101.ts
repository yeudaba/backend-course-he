// P28-E101: אומדן גב־המעטפה — ה־RPS גבוה מדי, והאחסון נמוך מדי. שלוש תקלות.
// avgRps = פעולות ביום / שניות ביום · peakRps = avgRps × peakFactor · storageGB = כל הפעולות בכל ימי השמירה × בתים / 10^9 · כולם לספרה אחת
//
// בדיקה:  npm run check P28-E101
const round1 = (x: number) => Math.round(x * 10) / 10;

export function estimate({ dau, actionsPerUser, peakFactor, bytesPerAction, retentionDays }: { dau: number; actionsPerUser: number; peakFactor: number; bytesPerAction: number; retentionDays: number }) {
  const perDay = dau * actionsPerUser;
  const avg = perDay / 3600;
  return {
    avgRps: round1(avg),
    peakRps: round1(avg * peakFactor),
    storageGB: round1((perDay * bytesPerAction) / 1e6),
  };
}
