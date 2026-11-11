function ordersByCustomer(orders) {
  const map = new Map();
  for (const o of orders) {
    if (!map.has(o.customerId)) {
      map.set(o.customerId, []);
    }
    map.get(o.customerId).push(o.id);
  }
  return map;
}

function customersWithoutOrders(customers, orders) {
  const withOrders = new Set(orders.map((o) => o.customerId));
  return customers.filter((c) => !withOrders.has(c.id)).map((c) => c.name);
}

function orphanOrders(customers, orders) {
  const ids = new Set(customers.map((c) => c.id));
  return orders.filter((o) => !ids.has(o.customerId)).map((o) => o.id);
}

const customers = [{ id: 1, name: "דנה" }, { id: 2, name: "עומר" }, { id: 3, name: "נועה" }];
const orders = [{ id: 10, customerId: 2 }, { id: 11, customerId: 9 }, { id: 12, customerId: 2 }];
console.log(ordersByCustomer(orders), customersWithoutOrders(customers, orders), orphanOrders(customers, orders));

module.exports = { ordersByCustomer, customersWithoutOrders, orphanOrders };
