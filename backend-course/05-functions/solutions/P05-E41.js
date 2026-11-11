function gradeText(score) {
  if (score < 0 || score > 100) {
    return "ציון לא חוקי";
  }
  if (score >= 90) {
    return "מצוין";
  }
  if (score >= 80) {
    return "טוב מאוד";
  }
  if (score >= 65) {
    return "טוב";
  }
  if (score >= 55) {
    return "עובר";
  }
  return "נכשל";
}

console.log(gradeText(82), gradeText(101));

module.exports = { gradeText };
