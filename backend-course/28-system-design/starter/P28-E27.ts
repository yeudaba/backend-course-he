// P28-E27: overallHealth — את הקובץ הזה לא משנים. כותבים לו בדיקות ב־P28-E27.spec.ts
//
// GET /health מחזיר מצב אחד לכל השירות, מתוך כמה בדיקות (מסד, Redis, שירות מיילים...):
//   - בדיקה קריטית (critical: true) שנכשלה ← "down": השירות לא יכול לעבוד, ה־load balancer מוציא אותו
//   - בדיקה לא קריטית שנכשלה, או בדיקה כלשהי שלקחה יותר מ־slowMs (ברירת מחדל 1000) ← "degraded"
//   - אחרת ← "up". בלי בדיקות בכלל ← "up"
// failing — שמות הבדיקות שנכשלו, לפי הסדר. slow — שמות הבדיקות האיטיות (גם אם עברו), לפי הסדר.

export type Check = { name: string; ok: boolean; critical: boolean; latencyMs: number };
export type Health = { status: "up" | "degraded" | "down"; failing: string[]; slow: string[] };

export function overallHealth(checks: Check[], slowMs = 1000): Health {
  const failing = checks.filter((c) => !c.ok).map((c) => c.name);
  const slow = checks.filter((c) => c.latencyMs > slowMs).map((c) => c.name);
  let status: Health["status"] = "up";
  if (failing.length > 0 || slow.length > 0) status = "degraded";
  if (checks.some((c) => c.critical && !c.ok)) status = "down";
  return { status, failing, slow };
}
