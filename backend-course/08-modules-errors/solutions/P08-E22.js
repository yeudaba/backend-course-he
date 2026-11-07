// P08-E22: הרצף הארוך ביותר — מתוקן
function longestStreak(days) {
  let best = 0;
  let current = 0;
  for (const visited of days) {
    current = visited ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}

console.log(longestStreak([true, false, true, true, true]));

module.exports = { longestStreak };
