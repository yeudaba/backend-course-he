// P27-E103: הלקוחות שהוציאו הכי הרבה — O(n + m)
export function topSpenders(customers: { id: number; name: string }[], orders: { customerId: number; total: number }[], minTotal: number) {
  const totals = new Map<number, number>();
  for (const o of orders) totals.set(o.customerId, (totals.get(o.customerId) ?? 0) + o.total);
  const result: { name: string; total: number }[] = [];
  for (const c of customers) {
    const total = totals.get(c.id) ?? 0;
    if (total >= minTotal) result.push({ name: c.name, total });
  }
  return result;
}
