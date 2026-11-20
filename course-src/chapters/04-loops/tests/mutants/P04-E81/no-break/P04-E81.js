const n = 91;
let smallest = n;
for (let d = n; d >= 2; d--) {
  if (n % d === 0) {
    smallest = d;
  }
}
console.log(`המחלק הקטן ביותר של ${n}: ${smallest}`);
// break
