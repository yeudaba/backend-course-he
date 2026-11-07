// P06-E25: twoSum ו־mergeSorted
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return null;
}

function mergeSorted(a, b) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      result.push(a[i]);
      i++;
    } else {
      result.push(b[j]);
      j++;
    }
  }
  return [...result, ...a.slice(i), ...b.slice(j)];
}

console.log(twoSum([2, 7, 11, 15], 9), twoSum([1, 2], 10));
console.log(mergeSorted([1, 4, 9], [2, 3, 10, 12]).join(", "));

module.exports = { twoSum, mergeSorted };
