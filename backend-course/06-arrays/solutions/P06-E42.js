function digits(n) {
  if (n === 0) {
    return [0];
  }
  const result = [];
  while (n > 0) {
    result.unshift(n % 10);
    n = Math.floor(n / 10);
  }
  return result;
}

console.log(digits(1234), digits(507), digits(0));

module.exports = { digits };
