// P27-E11
// חלון נע עם שני מצביעים: right מתקדם, left "מדביק" כשהחלון ארוך מדי. כל אינדקס נכנס ויוצא פעם אחת ← O(n)
export function peakInWindow(timestamps: readonly number[], windowMs: number): { count: number; start: number } {
  let best = { count: 0, start: timestamps[0] ?? 0 };
  let left = 0;
  for (let right = 0; right < timestamps.length; right++) {
    while (timestamps[right] - timestamps[left] >= windowMs) left++;
    const count = right - left + 1;
    if (count > best.count) best = { count, start: timestamps[left] };
  }
  return best;
}
