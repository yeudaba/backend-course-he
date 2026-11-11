// P11-E27: משך זמן
export function parseDuration(text: string): number | null {
  const words = text.split(" ").filter((w) => w !== "");
  if (words.length === 0) return null;

  let total = 0;
  for (const w of words) {
    const unit = w.slice(-1);
    const digits = w.slice(0, -1);
    const n = Number(digits);
    if (digits === "" || !Number.isInteger(n) || n < 0) return null;
    if (unit === "h") {
      total += n * 60;
    } else if (unit === "m") {
      total += n;
    } else {
      return null;
    }
  }
  return total;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h === 0) parts.push(`${m}m`);
  return parts.join(" ");
}

for (const t of ["1h 30m", "15m 1h", "1.5h", ""]) {
  const minutes = parseDuration(t);
  console.log(JSON.stringify(t), "→", minutes === null ? "לא תקין" : formatDuration(minutes));
}
