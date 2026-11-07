let primes = "";
let count = 0;

for (let n = 2; n <= 50; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      isPrime = false;
      break;
    }
  }
  if (isPrime) {
    primes += n + " ";
    count++;
  }
}

console.log(primes.trim());
console.log(`כמות: ${count}`);
