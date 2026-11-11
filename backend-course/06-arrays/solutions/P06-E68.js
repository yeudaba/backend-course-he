function gradeLabel(score) {
  if (score >= 90) {
    return "מצוין";
  }
  if (score >= 55) {
    return "עובר";
  }
  return "נכשל";
}

function gradeLabels(scores) {
  return scores.map(gradeLabel);
}

console.log(gradeLabels([95, 40, 70]));

module.exports = { gradeLabel, gradeLabels };
