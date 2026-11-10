// P30-E32: isValidIsraeliId — את הקובץ הזה לא משנים. כותבים לו בדיקות ב־P30-E32.spec.ts
//
// בדיקת ספרת ביקורת של מספר זהות ישראלי (שאלה נפוצה בראיונות בארץ):
//   - רק ספרות, 1 עד 9 ספרות (רווחים מסביב מותרים). פחות מ־9 ← משלימים באפסים משמאל: "1234" ← "000001234"
//   - כל ספרה מוכפלת לסירוגין ב־1 וב־2 (הראשונה ב־1). תוצאה מעל 9 ← סכום הספרות שלה (12 ← 3, כלומר 12 - 9)
//   - המספר תקין אם סכום כל התוצאות מתחלק ב־10. "000000000" לא תקין.

export function isValidIsraeliId(input: string): boolean {
  const id = input.trim();
  if (!/^\d{1,9}$/.test(id)) return false;
  const digits = id.padStart(9, "0");
  if (digits === "000000000") return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let n = Number(digits[i]) * (i % 2 === 0 ? 1 : 2);
    if (n > 9) n -= 9;
    sum += n;
  }
  return sum % 10 === 0;
}
