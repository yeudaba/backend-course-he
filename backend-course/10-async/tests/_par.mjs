// עוזר לבדיקות: "האם הקריאות רצות במקביל?" — בלי שעון, כדי שמחשב איטי לא יכשיל פתרון נכון.
// עוטפים את הפונקציה האסינכרונית וסופרים כמה קריאות "פתוחות" (התחילו ועוד לא הסתיימו) בו־זמנית.
// ברצף (await אחרי await) — אף פעם לא יותר מאחת. במקביל — כולן מתחילות לפני שהראשונה מסתיימת.
export function inFlight(fn) {
  let active = 0;
  let max = 0;
  const wrapped = (...args) => {
    active++;
    max = Math.max(max, active);
    let p;
    try {
      p = Promise.resolve(fn(...args));
    } catch (err) {
      active--;
      throw err;
    }
    return p.finally(() => {
      active--;
    });
  };
  return {
    fn: wrapped,
    get max() {
      return max;
    },
  };
}

export const parallelMessage = (max, n, tool = "Promise.all") =>
  `רק ${max} מתוך ${n} קריאות רצו בו־זמנית — נראה שהן מחכות אחת לשנייה (await בתוך לולאה?). להפעיל את כולן ואז לחכות לכולן: ${tool}`;
