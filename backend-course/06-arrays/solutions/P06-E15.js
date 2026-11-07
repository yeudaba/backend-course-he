// P06-E15: some, every, findIndex
const passedCount = (scores, min = 55) => scores.filter((s) => s >= min).length;
const allPassed = (scores, min = 55) => scores.length > 0 && scores.every((s) => s >= min);
const hasPerfect = (scores) => scores.some((s) => s === 100);
const firstFailIndex = (scores, min = 55) => scores.findIndex((s) => s < min);

const scores = [80, 54, 100, 70];
console.log(passedCount(scores), allPassed(scores), hasPerfect(scores), firstFailIndex(scores), allPassed([]));

module.exports = { passedCount, allPassed, hasPerfect, firstFailIndex };
