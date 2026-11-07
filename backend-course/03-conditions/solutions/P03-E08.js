const score = 82;
let label;

if (score < 0 || score > 100) {
  label = "ציון לא חוקי";
} else if (score >= 90) {
  label = "מצוין";
} else if (score >= 80) {
  label = "טוב מאוד";
} else if (score >= 65) {
  label = "טוב";
} else if (score >= 55) {
  label = "עובר";
} else {
  label = "נכשל";
}

console.log(`ציון ${score}: ${label}`);
