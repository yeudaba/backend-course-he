// P22-E12 — הקוד שבודקים (לא משנים אותו)
// debounce: רק אחרי waitMs בלי קריאות חדשות — fn רץ פעם אחת, עם הארגומנטים של הקריאה האחרונה
export function debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  };
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  return debounced;
}
