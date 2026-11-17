// P27-E49: הרצף הארוך ביותר בלי חזרה
export function longestUnique<T>(items: T[]) {
  const lastAt = new Map<T, number>();
  let left = 0;
  let best = { length: 0, start: 0 };
  for (let right = 0; right < items.length; right++) {
    const last = lastAt.get(items[right]);
    if (last !== undefined && last >= left) left = last + 1;
    lastAt.set(items[right], right);
    if (right - left + 1 > best.length) best = { length: right - left + 1, start: left };
  }
  return best;
}
