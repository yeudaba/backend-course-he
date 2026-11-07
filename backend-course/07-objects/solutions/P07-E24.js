// P07-E24: מלאי והזמנות — הכול או כלום
function applyOrder(inventory, order) {
  const next = { ...inventory };
  for (const { code, qty } of order.items) {
    if (!(code in next)) {
      return { ok: false, inventory, error: `מוצר ${code} לא קיים` };
    }
    if (next[code] < qty) {
      return { ok: false, inventory, error: `אין מספיק מלאי של ${code} (נשארו ${next[code]})` };
    }
    next[code] -= qty;
  }
  return { ok: true, inventory: next };
}

function processOrders(inventory, orders) {
  let current = inventory;
  const accepted = [];
  const rejected = [];
  for (const order of orders) {
    const result = applyOrder(current, order);
    if (result.ok) {
      current = result.inventory;
      accepted.push(order.id);
    } else {
      rejected.push({ id: order.id, error: result.error });
    }
  }
  return { inventory: current, accepted, rejected };
}

const inventory = { A: 5, B: 1 };
const orders = [
  { id: 1, items: [{ code: "A", qty: 2 }, { code: "B", qty: 1 }] },
  { id: 2, items: [{ code: "A", qty: 2 }, { code: "B", qty: 1 }] },
  { id: 3, items: [{ code: "A", qty: 2 }, { code: "A", qty: 2 }] },
  { id: 4, items: [{ code: "Z", qty: 1 }] },
];
console.log(processOrders(inventory, orders), inventory);

module.exports = { applyOrder, processOrders };
