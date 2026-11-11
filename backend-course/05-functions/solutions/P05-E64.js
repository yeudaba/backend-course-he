function findFirst(from, to, predicate) {
  for (let i = from; i <= to; i++) {
    if (predicate(i)) {
      return i;
    }
  }
  return null;
}

console.log(findFirst(1000, 2000, (n) => n % 7 === 0 && n % 13 === 0));

module.exports = { findFirst };
