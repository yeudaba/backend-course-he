// P28.5-E21: דוח latency מכמה שרתים — אחרי התיקון
export function latencyReport(perInstance: number[][]): { count: number; p50: number; p99: number } {
  // תיקון 3: percentile של כל הדגימות יחד — לא ממוצע של ה־p99 של כל שרת
  const all = perInstance.flat();
  all.sort((a, b) => a - b); // תיקון 1: מיון מספרי (ברירת המחדל ממיינת כמחרוזות: 100 < 9)
  // תיקון 2: nearest-rank — ceil(p × n), ואינדקס מ־0
  const at = (p: number) => all[Math.ceil((p / 100) * all.length) - 1];
  return { count: all.length, p50: at(50), p99: at(99) };
}
