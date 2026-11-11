const { sum, average } = require("./P08-E34-math");

function describe(nums) {
  return `${nums.length} מספרים, סכום ${sum(nums)}, ממוצע ${average(nums)}`;
}

console.log(describe([1, 2, 3, 6]));

module.exports = { describe };
