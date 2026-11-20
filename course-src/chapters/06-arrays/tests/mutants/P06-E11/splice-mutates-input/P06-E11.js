const onlyPositive = (nums) => nums.filter((n) => n > 0);
const longWords = (words, minLength) => words.filter((w) => w.length >= minLength);
function withoutValue(arr, value) {
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i] === value) arr.splice(i, 1);
  return arr;
}
module.exports = { onlyPositive, longWords, withoutValue };
