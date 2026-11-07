// P07-E24: מלאי והזמנות — בלי לשנות אף קלט!
// inventory = { A: 5, B: 1 }   order = { id: 1, items: [{ code: "A", qty: 2 }] }
// הצלחה: { ok: true, inventory: מלאי חדש }
// כישלון: { ok: false, inventory: המלאי המקורי, error: ... } — הכול או כלום
// הודעות שגיאה:
//   `מוצר ${code} לא קיים`
//   `אין מספיק מלאי של ${code} (נשארו ${כמה שנשאר})`
function applyOrder(inventory, order) {
  // כתוב כאן
}

// מחזירה { inventory, accepted: [ids], rejected: [{ id, error }] }
function processOrders(inventory, orders) {
  // כתוב כאן
}

module.exports = { applyOrder, processOrders };
