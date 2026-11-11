function sum(nums) {
  return nums.reduce((total, n) => total + n, 0);
}

function average(nums) {
  if (nums.length === 0) {
    return 0;
  }
  return sum(nums) / nums.length;
}

module.exports = { sum, average };
