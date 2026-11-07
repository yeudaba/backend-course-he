// P08-E11: ממוצע — מתוקן
function averageScore(scores) {
  if (scores.length === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < scores.length; i++) {
    sum += scores[i];
  }
  return sum / scores.length;
}

console.log(averageScore([80, 90, 100]));

module.exports = { averageScore };
