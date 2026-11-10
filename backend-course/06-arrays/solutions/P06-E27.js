// P06-E27: סדרת קולץ
function collatz(n) {
  const steps = [n];
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : n * 3 + 1;
    steps.push(n);
  }
  return steps;
}

console.log(collatz(6).join(" → "));
console.log(collatz(27).length);

module.exports = { collatz };
