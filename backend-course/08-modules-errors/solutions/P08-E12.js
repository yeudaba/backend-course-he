// P08-E12: נקי מ־ESLint
const ACTIVE = 1;

function isActive(statusFromUrl) {
  return Number(statusFromUrl) === ACTIVE;
}

function countActive(statuses) {
  let count = 0;
  for (const s of statuses) {
    if (isActive(s)) {
      count++;
    }
  }
  return count;
}

console.log(countActive(["1", "0", "1", "", " "]));

module.exports = { isActive, countActive };
