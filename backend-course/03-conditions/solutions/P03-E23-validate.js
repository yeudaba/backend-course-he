const ageInput = "   ";
const age = Number(ageInput);

if (ageInput.trim() === "") {
  console.log("שגיאה: חובה להזין גיל");
} else if (Number.isNaN(age)) {
  console.log("שגיאה: גיל חייב להיות מספר");
} else if (age < 0 || age > 120) {
  console.log("שגיאה: גיל לא הגיוני");
} else if (age < 18) {
  console.log("קבוצה: קטין");
} else if (age < 65) {
  console.log("קבוצה: מבוגר");
} else {
  console.log("קבוצה: גמלאי");
}
