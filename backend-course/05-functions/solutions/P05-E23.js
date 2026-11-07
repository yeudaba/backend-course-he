// P05-E23: קבוצת גיל — guard clauses בסדר הנכון
function ageGroup(input, minAge = 0) {
  if (input.trim() === "") {
    return "שגיאה: חובה להזין גיל";
  }
  const age = Number(input);
  if (Number.isNaN(age)) {
    return "שגיאה: גיל חייב להיות מספר";
  }
  if (age < minAge || age > 120) {
    return "שגיאה: גיל לא הגיוני";
  }
  if (age < 18) {
    return "קבוצה: קטין";
  }
  if (age < 65) {
    return "קבוצה: מבוגר";
  }
  return "קבוצה: גמלאי";
}

console.log(ageGroup("0"), "|", ageGroup("   "), "|", ageGroup("70"));

module.exports = { ageGroup };
