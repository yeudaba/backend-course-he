// P07-E23: מתוקן
function stockLookup(items) {
  const map = new Map();
  for (const item of items) {
    map.set(item.id, item.stock);
  }
  return map;
}

function getStock(lookup, idFromUrl) {
  return lookup.get(Number(idFromUrl)) ?? 0;
}

const lookup = stockLookup([{ id: 1, stock: 5 }, { id: 2, stock: 0 }]);
console.log(getStock(lookup, "1"), getStock(lookup, "2"), getStock(lookup, "9"), lookup.size);

module.exports = { stockLookup, getStock };
