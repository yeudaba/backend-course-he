// P08-E22: הרצף הארוך ביותר של true
// longestStreak([true, false, true, true, true]) → 3
function longestStreak(days) {
  let best = 0;
  let current = 0;
  for (const visited of days) {
    if (visited) {
      current++;
    } else {
      if (current > best) {
        best = current;
      }
      current = 0;
    }
  }
  return best;
}

longestStreak([true, false, true, true, true]);

module.exports = { longestStreak };
