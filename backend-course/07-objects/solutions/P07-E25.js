// P07-E25: twoSum ב־O(n) ואנגרמות
function twoSumFast(nums, target) {
  const seen = new Map();
  for (let j = 0; j < nums.length; j++) {
    const need = target - nums[j];
    if (seen.has(need)) {
      return [seen.get(need), j];
    }
    if (!seen.has(nums[j])) {
      seen.set(nums[j], j);
    }
  }
  return null;
}

function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = w.split("").sort().join("");
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(w);
  }
  return [...groups.values()];
}

console.log(twoSumFast([2, 7, 11, 15], 9), twoSumFast([3, 3], 6));
console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));

module.exports = { twoSumFast, groupAnagrams };
