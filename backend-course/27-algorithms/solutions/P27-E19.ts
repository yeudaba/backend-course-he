// P27-E19
// sweep line: כל סשן = שני אירועים (+1 בהתחלה, −1 בסוף). ממיינים לפי זמן — וסוף לפני התחלה באותו רגע
// (end לא כולל: סשן שנגמר ב־10 וסשן שמתחיל ב־10 לא חופפים). O(n log n)
export function peakConcurrency(sessions: readonly { start: number; end: number }[]): { peak: number; at: number | null } {
  const events: [number, number][] = [];
  for (const s of sessions) {
    if (s.end <= s.start) continue;
    events.push([s.start, 1], [s.end, -1]);
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let current = 0;
  let best = { peak: 0, at: null as number | null };
  for (const [time, delta] of events) {
    current += delta;
    if (current > best.peak) best = { peak: current, at: time };
  }
  return best;
}
