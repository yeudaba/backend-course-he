function firstBad(n, isBad) {
  let low = 1;
  let high = n;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (isBad(mid)) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}

let calls = 0;
console.log(firstBad(1000, (v) => {
  calls++;
  return v >= 437;
}), calls);

module.exports = { firstBad };
