function twoSum(nums, target) { for (let i = 0; i < nums.length; i++) { const j = nums.indexOf(target - nums[i]); if (j !== -1 && j !== i) return [Math.min(i, j), Math.max(i, j)]; } return null; }
function mergeSorted(a, b) { const r = []; let i = 0, j = 0; while (i < a.length && j < b.length) r.push(a[i] <= b[j] ? a[i++] : b[j++]); return [...r, ...a.slice(i), ...b.slice(j)]; }
module.exports = { twoSum, mergeSorted };
