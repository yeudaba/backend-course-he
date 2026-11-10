// P05-E28: מספר ראשוני
function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

const primes = [];
for (let i = 1; i <= 30; i++) {
  if (isPrime(i)) primes.push(i);
}
console.log(primes.join(" "));

module.exports = { isPrime };
