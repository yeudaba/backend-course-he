// P30-E17
// מעקב אחרי מועמדויות: חיפוש עבודה הוא משפך — וכדאי לדעת איפה הוא נתקע.
// שיעור תגובה נמוך ← קורות החיים / ההתאמה; הרבה ראיונות ובלי הצעות ← הכנה לראיונות
export type Stage = "applied" | "screen" | "interview" | "offer" | "rejected";
export interface Application {
  company: string;
  stage: Stage;
  appliedAt: string; // ISO
  lastUpdate: string; // ISO
}

const DAY = 86_400_000;

export function pipelineStats(apps: readonly Application[], now: Date, { followUpDays = 7 }: { followUpDays?: number } = {}) {
  const byStage: Record<Stage, number> = { applied: 0, screen: 0, interview: 0, offer: 0, rejected: 0 };
  for (const a of apps) byStage[a.stage]++;
  const responded = apps.length - byStage.applied;
  const reachedInterview = byStage.interview + byStage.offer;
  const followUps = apps
    .filter((a) => a.stage === "applied" && now.getTime() - Date.parse(a.lastUpdate) >= followUpDays * DAY)
    .sort((a, b) => Date.parse(a.lastUpdate) - Date.parse(b.lastUpdate))
    .map((a) => a.company);
  const rate = (n: number) => (apps.length ? Math.round((n / apps.length) * 100) / 100 : 0);
  return { total: apps.length, byStage, responseRate: rate(responded), interviewRate: rate(reachedInterview), followUps };
}
