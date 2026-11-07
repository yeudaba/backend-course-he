// P22-E17 — הקוד שבודקים (לא משנים אותו)
// מספר תעודת זהות: עד 9 ספרות (משלימים 0 משמאל), וספרת ביקורת:
// כל ספרה כפול 1 או 2 לסירוגין; תוצאה מעל 9 ← מחסירים 9; הסכום מתחלק ב־10.
export function isValidIsraeliId(input: string): boolean {
  const id = input.trim();
  if (!/^\d{1,9}$/.test(id)) return false;
  const digits = id.padStart(9, "0");
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let n = Number(digits[i]) * ((i % 2) + 1);
    if (n > 9) n -= 9;
    sum += n;
  }
  return sum % 10 === 0;
}
