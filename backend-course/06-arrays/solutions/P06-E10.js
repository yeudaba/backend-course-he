// P06-E10: map
const round2 = (n) => Math.round(n * 100) / 100;

function addVat(prices, rate) {
  return prices.map((p) => round2(p * (1 + rate)));
}

function numbered(items) {
  return items.map((item, i) => `${i + 1}. ${item}`);
}

function toNumbers(strings) {
  return strings.map(Number);
}

console.log(addVat([100, 49.9], 0.18), numbered(["תה", "קפה"]), toNumbers(["1", "2.5"]));

module.exports = { addVat, numbered, toNumbers };
