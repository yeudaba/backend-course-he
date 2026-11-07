// P06-E11: filter
const onlyPositive = (nums) => nums.filter((n) => n > 0);
const longWords = (words, minLength) => words.filter((w) => w.length >= minLength);
const withoutValue = (arr, value) => arr.filter((x) => x !== value);

console.log(onlyPositive([3, -1, 0, 7]), longWords(["a", "node", "js"], 2), withoutValue([1, 2, 1, 3], 1));

module.exports = { onlyPositive, longWords, withoutValue };
