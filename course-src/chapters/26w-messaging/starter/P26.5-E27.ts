// P26.5-E27: decide — את הקובץ הזה לא משנים. כותבים לו בדיקות ב־P26.5-E27.spec.ts
//
// consumer שנכשל בטיפול בהודעה שואל: לנסות שוב, או לשלוח ל־dead letter?
//   - attempt: מספר הניסיון שנכשל עכשיו (1 = הניסיון הראשון). לא שלם או קטן מ־1 ← RangeError
//   - שגיאה שאינה retryable (הודעה שבורה, מוצר שלא קיים) ← dead-letter מיד. ה־reason כולל את הודעת השגיאה
//   - הגענו ל־maxAttempts ניסיונות ← dead-letter. ה־reason כולל את הודעת השגיאה
//   - אחרת ← retry, עם השהיה של 1000ms × 2^(attempt-1): ‏1000, 2000, 4000... ולכל היותר 60,000ms

export type Decision = { action: "retry"; delayMs: number } | { action: "dead-letter"; reason: string };

export function decide(attempt: number, maxAttempts: number, error: { retryable: boolean; message: string }): Decision {
  if (!Number.isInteger(attempt) || attempt < 1) throw new RangeError(`attempt לא תקין: ${attempt}`);
  if (!error.retryable) return { action: "dead-letter", reason: `שגיאה קבועה: ${error.message}` };
  if (attempt >= maxAttempts) return { action: "dead-letter", reason: `נכשל ${attempt} פעמים: ${error.message}` };
  return { action: "retry", delayMs: Math.min(60_000, 1000 * 2 ** (attempt - 1)) };
}
