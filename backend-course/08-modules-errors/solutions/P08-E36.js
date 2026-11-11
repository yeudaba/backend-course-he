let count = 0;

function nextOrderNumber() {
  count++;
  return `ORD-${String(count).padStart(5, "0")}`;
}

function peek() {
  return count;
}

function resetOrders() {
  count = 0;
}

console.log(nextOrderNumber(), nextOrderNumber(), peek());

module.exports = { nextOrderNumber, peek, resetOrders };
