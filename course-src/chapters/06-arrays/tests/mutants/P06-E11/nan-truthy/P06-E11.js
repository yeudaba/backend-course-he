const onlyPositive = (nums) => nums.filter((n) => n > 0);
const longWords = (words, minLength) => words.filter((w) => w.length >= minLength);
const withoutValue = (arr, value) => arr.filter((x) => x != value);
module.exports = { onlyPositive, longWords, withoutValue };
