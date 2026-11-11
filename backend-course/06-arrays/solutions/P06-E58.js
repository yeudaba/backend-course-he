function longestStreak(results, kind = "W") {
  let current = 0;
  let best = 0;
  for (const r of results) {
    if (r === kind) {
      current++;
      if (current > best) {
        best = current;
      }
    } else {
      current = 0;
    }
  }
  return best;
}

console.log(longestStreak(["W", "W", "L", "W", "W", "W", "D"]), longestStreak(["W", "L", "L", "L", "W"], "L"));

module.exports = { longestStreak };
