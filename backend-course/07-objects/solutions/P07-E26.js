// P07-E26: mapValues
function mapValues(obj, fn) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value)]));
}

const prices = { keyboard: 100, mouse: 50 };
console.log(mapValues(prices, (p) => p * 2));
console.log(prices);

module.exports = { mapValues };
