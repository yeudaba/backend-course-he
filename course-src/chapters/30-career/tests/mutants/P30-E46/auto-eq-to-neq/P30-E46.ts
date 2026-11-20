// P30-E46: מה ההיסטוריה אומרת
const VAGUE = new Set(["wip", "fix", "update", "stuff", "changes", "asdf"]);

export function historyStats(log: string) {
  const days = new Set<string>();
  const vague: string[] = [];
  let commits = 0;
  for (const line of log.split("\n")) {
    if (!line.trim()) continue;
    const [sha, date, ...rest] = line.split("|");
    if (rest.length !== 0) throw new Error(`שורה לא תקינה: ${line}`);
    const subject = rest.join("|").trim();
    commits++;
    days.add(date);
    if (VAGUE.has(subject.toLowerCase()) || subject.split(/\s+/).filter(Boolean).length < 2) vague.push(sha);
  }
  const sorted = [...days].sort();
  let longestGapDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    longestGapDays = Math.max(longestGapDays, Math.round((Date.parse(sorted[i]) - Date.parse(sorted[i - 1])) / 86_400_000));
  }
  return { commits, activeDays: days.size, longestGapDays, vague };
}
