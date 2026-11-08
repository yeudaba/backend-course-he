// תאריכים ואזורי זמן — במקום אחד.
// כלל: במסד וב־API — רגעים ב־UTC (ISO, עם Z). "היום" — תלוי במשתמש.

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

// התאריך המקומי (YYYY-MM-DD) של רגע מסוים באזור זמן מסוים.
// en-CA: הפורמט הוא בדיוק YYYY-MM-DD
export function localDate(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
}
