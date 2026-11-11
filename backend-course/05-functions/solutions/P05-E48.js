function isEven(n) {
  return n % 2 === 0;
}

function isOdd(n) {
  return !isEven(n);
}

console.log(isEven(4), isOdd(-3), -3 % 2);

module.exports = { isEven, isOdd };
