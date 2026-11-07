// P03-E21: בדיקת הרשאה לצפייה בדוח. שני באגים לוגיים.
// הכלל: מותר לצפות אם התפקיד הוא admin או owner, וגם הגיל מעל 18.
// עם הערכים למטה (viewer, 17) הפלט הרצוי: מותר לצפות? false
const role = "viewer";
const age = 17;

const isAllowedRole = role === "admin" || "owner";
const isAdult = !age < 18;

console.log("מותר לצפות?", isAllowedRole && isAdult);
