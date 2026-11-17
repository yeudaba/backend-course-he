// P27-E36: multiset — מספיק מכל דבר?
export function canFulfill(order: string[], stock: string[]): boolean {
  const left = new Map<string, number>();
  for (const s of stock) left.set(s, (left.get(s) ?? 0) + 1);
  for (const o of order) {
    const n = left.get(o) ?? 0;
    if (n === 0) return false;
    left.set(o, n - 1);
  }
  return true;
}
