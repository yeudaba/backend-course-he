function countAbove(nums, limit) {
  let count = 0;
  for (const n of nums) {
    if (n > limit) {
      count++;
    }
  }
  return count;
}

console.log(countAbove([5, 12, 8, 20], 8));

module.exports = { countAbove };
