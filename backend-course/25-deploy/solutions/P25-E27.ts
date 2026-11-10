// P25-E27 — כמה זמן השרת למעלה
const UNITS: [string, number][] = [
  ["d", 86_400],
  ["h", 3_600],
  ["m", 60],
  ["s", 1],
];

export function formatUptime(totalSeconds: number): string {
  if (!Number.isInteger(totalSeconds) || totalSeconds < 0) throw new RangeError("totalSeconds חייב להיות מספר שלם לא שלילי");
  let rest = totalSeconds;
  const parts = UNITS.map(([unit, size]) => {
    const value = Math.floor(rest / size);
    rest %= size;
    return { unit, value };
  });
  const first = parts.findIndex((p) => p.value > 0);
  if (first === -1) return "0s";
  return parts
    .slice(first, first + 2)
    .filter((p) => p.value > 0)
    .map((p) => `${p.value}${p.unit}`)
    .join(" ");
}

for (const s of [0, 42, 60, 3_601, 3_661, 90_061, 1_209_600 + 7_200 + 59]) console.log(s, "→", formatUptime(s));
