// P22-E74 — הקוד שבודקים (לא משנים אותו)
// פחות משעה ← "m:ss" · שעה ומעלה ← "h:mm:ss" · לא שלם או שלילי ← RangeError
export function formatDuration(totalSeconds: number): string {
  if (!Number.isInteger(totalSeconds) || totalSeconds < 0) throw new RangeError("totalSeconds חייב להיות מספר שלם לא שלילי");
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ss = String(s).padStart(2, "0");
  if (h === 0) return `${m}:${ss}`;
  return `${h}:${String(m).padStart(2, "0")}:${ss}`;
}
