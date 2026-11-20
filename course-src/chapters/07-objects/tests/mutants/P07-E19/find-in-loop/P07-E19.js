function attachCustomers(orders, customers) { return orders.map((o) => ({ ...o, customerName: customers.find((c) => c.id === o.customerId)?.name ?? null })); }
function totalsByCustomer(orders, customers) {
  const t = {};
  for (const o of orders) { const c = customers.find((x) => x.id === o.customerId); if (c) t[c.name] = (t[c.name] ?? 0) + o.total; }
  return Object.entries(t).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
}
module.exports = { attachCustomers, totalsByCustomer };
