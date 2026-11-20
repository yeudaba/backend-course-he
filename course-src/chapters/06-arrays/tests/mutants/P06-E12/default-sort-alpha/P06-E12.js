const sortAsc = (nums) => [...nums].sort((a, b) => a - b);
const sortDesc = (nums) => [...nums].sort((a, b) => b - a);
const sortByLength = (words) => [...words].sort((a, b) => a.length - b.length);
const sortAlpha = (words) => [...words].sort();
module.exports = { sortAsc, sortDesc, sortByLength, sortAlpha };
