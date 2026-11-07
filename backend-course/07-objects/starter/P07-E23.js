// P07-E23: שני באגים — שום חיפוש לא מוצא כלום
// items = [{ id: 1, stock: 5 }, ...] → Map של id → stock
function stockLookup(items) {
  const map = new Map();
  for (const item of items) {
    map[item.id] = item.stock;
  }
  return map;
}

// idFromUrl מגיע מכתובת — מחרוזת, למשל "1". מוצר לא קיים → 0
function getStock(lookup, idFromUrl) {
  return lookup.get(idFromUrl) ?? 0;
}

module.exports = { stockLookup, getStock };
