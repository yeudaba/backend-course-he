// P06-E17: min, max, average עם reduce
function stats(nums) {
  if (nums.length === 0) {
    return null;
  }
  const min = nums.reduce((m, n) => (n < m ? n : m), nums[0]);
  const max = nums.reduce((m, n) => (n > m ? n : m), nums[0]);
  const total = nums.reduce((s, n) => s + n, 0);
  const average = Math.round((total / nums.length) * 100) / 100;
  return [min, max, average];
}

console.log(stats([4, -2, 9, 1]), stats([]));

module.exports = { stats };
