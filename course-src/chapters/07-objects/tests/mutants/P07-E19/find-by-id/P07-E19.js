function attachCustomers(orders, customers) {
  return orders.map((o) => ({ ...o, customerName: customers.find((c) => c.id === o.customerId)?.name ?? null }));
}
function totalsByCustomer(orders, customers) {
  const totals = {};
  for (const o of orders) {
    const c = customers.find((x) => x.id === o.customerId);
    if (c) totals[c.id] = { name: c.name, total: (totals[c.id]?.total ?? 0) + o.total };
  }
  return Object.values(totals).sort((a, b) => b.total - a.total);
}
module.exports = { attachCustomers, totalsByCustomer };
