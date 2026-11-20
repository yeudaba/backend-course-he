// P27-E103: הלקוחות שהוציאו הכי הרבה — איטי מאוד על 5,000 × 50,000, מפספס את הסף, וסדר לא יציב בשוויון.
// topSpenders(customers, orders, minTotal) ← [{ name, total }] — לפחות minTotal, מהגבוה, בשוויון לפי שם
//
// בדיקה:  npm run check P27-E103
export function topSpenders(customers: { id: number; name: string }[], orders: { customerId: number; total: number }[], minTotal: number) {
  const result: { name: string; total: number }[] = [];
  for (const c of customers) {
    const total = orders.filter((o) => o.customerId === c.id).reduce((s, o) => s + o.total, 0);
    if (total > minTotal) result.push({ name: c.name, total });
  }
  return result.sort((a, b) => b.total - a.total);
}
