// P07-E27: מלאי פרטי
function createStock() {
  const items = new Map();

  function count(item) {
    return items.get(item) ?? 0;
  }

  function add(item, qty) {
    items.set(item, count(item) + qty);
  }

  function take(item, qty) {
    if (count(item) < qty) return false;
    items.set(item, count(item) - qty);
    return true;
  }

  return { add, take, count };
}

const stock = createStock();
stock.add("pen", 5);
console.log(stock.take("pen", 2), stock.take("pen", 10), stock.count("pen"), stock.count("cup"));
console.log(stock.items);

module.exports = { createStock };
