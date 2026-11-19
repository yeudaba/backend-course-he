function applyOrder(inventory, order) {
  const next = { ...inventory };
  for (const { code, qty } of order.items) {
    if (next[code] === undefined) return { ok: false, inventory, error: `מוצר ${code} לא קיים` };
    if (next[code] < qty) return { ok: false, inventory, error: `אין מספיק מלאי של ${code} (נשארו ${inventory[code]})` };
    next[code] -= qty;
  }
  return { ok: true, inventory: next };
}
function processOrders(inventory, orders) { let cur = inventory; const accepted = [], rejected = []; for (const o of orders) { const r = applyOrder(cur, o); if (r.ok) { cur = r.inventory; accepted.push(o.id); } else rejected.push({ id: o.id, error: r.error }); } return { inventory: cur, accepted, rejected }; }
module.exports = { applyOrder, processOrders };
