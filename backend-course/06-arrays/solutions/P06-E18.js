// P06-E18: topN וחציון
function topN(nums, n) {
  return [...nums].sort((a, b) => b - a).slice(0, n);
}

function median(nums) {
  if (nums.length === 0) {
    return null;
  }
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

console.log(topN([5, 100, 20, 7], 2), median([5, 1, 9]), median([4, 1, 3, 10]));

module.exports = { topN, median };
