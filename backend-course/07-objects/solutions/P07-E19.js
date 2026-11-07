// P07-E19: חיבור נתונים לפי מזהה
const indexById = (list) => new Map(list.map((x) => [x.id, x]));

function attachCustomers(orders, customers) {
  const byId = indexById(customers);
  return orders.map((o) => ({ ...o, customerName: byId.get(o.customerId)?.name ?? null }));
}

function totalsByCustomer(orders, customers) {
  const byId = indexById(customers);
  const totals = new Map();
  for (const o of orders) {
    if (byId.has(o.customerId)) {
      totals.set(o.customerId, (totals.get(o.customerId) ?? 0) + o.total);
    }
  }
  return [...totals]
    .map(([id, total]) => ({ name: byId.get(id).name, total }))
    .sort((a, b) => b.total - a.total);
}

const customers = [{ id: 1, name: "דנה" }, { id: 2, name: "עומר" }];
const orders = [
  { id: 7, customerId: 2, total: 320 },
  { id: 8, customerId: 1, total: 150 },
  { id: 9, customerId: 2, total: 80 },
  { id: 10, customerId: 3, total: 40 },
];
console.log(attachCustomers(orders, customers)[3], totalsByCustomer(orders, customers));

module.exports = { attachCustomers, totalsByCustomer };
