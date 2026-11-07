// P06-E12: מיון בלי לשנות את המקור
const sortAsc = (nums) => [...nums].sort((a, b) => a - b);
const sortDesc = (nums) => [...nums].sort((a, b) => b - a);
const sortByLength = (words) => [...words].sort((a, b) => a.length - b.length);
const sortAlpha = (words) => [...words].sort((a, b) => a.localeCompare(b));

const original = [10, 1, 5];
console.log(sortAsc(original), sortDesc(original), original);

module.exports = { sortAsc, sortDesc, sortByLength, sortAlpha };
