// P06-E08: סכום וממוצע
function sum(nums) {
  let total = 0;
  for (const n of nums) {
    total += n;
  }
  return total;
}

function average(nums) {
  if (nums.length === 0) {
    return 0;
  }
  return sum(nums) / nums.length;
}

console.log(sum([1, 2, 3]), average([90, 80, 70]), average([]));

module.exports = { sum, average };
