function between(min, max) {
  return (n) => n >= min && n <= max;
}

function not(predicate) {
  return (x) => !predicate(x);
}

const prices = [5, 12, 30, 18, 50];
console.log(prices.filter(between(10, 20)), prices.filter(not(between(10, 20))), prices.some(between(40, 60)));

module.exports = { between, not };
