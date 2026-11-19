function attachCustomers(orders, customers) { const m = new Map(customers.map((c) => [c.id, c.name])); return orders.map((o) => ({ ...o, customerName: m.get(o.customerId) ?? null })); }
function totalsByCustomer(orders, customers) {
  const m = new Map(customers.map((c) => [c.id, c.name])); const t = new Map();
  for (const o of orders) { const n = m.get(o.customerId); if (n) t.set(n, (t.get(n) ?? 0) + o.total); }
  return [...t].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
}
module.exports = { attachCustomers, totalsByCustomer };
