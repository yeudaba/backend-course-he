// P08-E11: הממוצע יוצא שגוי. מצא עם הדיבאגר (בלי console.log!) ותקן.
// averageScore([80, 90, 100]) → 90 | averageScore([]) → 0
function averageScore(scores) {
  if (scores.length === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 1; i < scores.length; i++) {
    sum += scores[i];
  }
  return sum / (scores.length - 1);
}

averageScore([80, 90, 100]);

module.exports = { averageScore };
