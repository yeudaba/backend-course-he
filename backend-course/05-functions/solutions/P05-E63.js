function countIf(from, to, predicate) {
  let count = 0;
  for (let i = from; i <= to; i++) {
    if (predicate(i)) {
      count++;
    }
  }
  return count;
}

console.log(countIf(1, 100, (n) => n % 7 === 0));

module.exports = { countIf };
