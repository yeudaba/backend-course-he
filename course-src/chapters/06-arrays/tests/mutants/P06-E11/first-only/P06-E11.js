const onlyPositive = (nums) => nums.filter((n) => n > 0);
const longWords = (words, minLength) => words.filter((w) => w.length >= minLength);
function withoutValue(arr, value) { const i = arr.indexOf(value); return i === -1 ? arr : [...arr.slice(0, i), ...arr.slice(i + 1)]; }
module.exports = { onlyPositive, longWords, withoutValue };
