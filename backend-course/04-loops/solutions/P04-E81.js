const n = 91;
let smallest = n;
for (let d = 2; d <= n; d++) {
  if (n % d === 0) {
    smallest = d;
    break;
  }
}
console.log(`המחלק הקטן ביותר של ${n}: ${smallest}`);
