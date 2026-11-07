// P05-E13: בדיקת אימייל עם guard clauses
function validateEmail(email) {
  const clean = email.trim();
  if (clean === "") {
    return "חובה להזין אימייל";
  }
  if (clean.includes(" ")) {
    return "אימייל לא יכול להכיל רווחים";
  }
  const at = clean.indexOf("@");
  if (at <= 0 || at === clean.length - 1) {
    return "חסר @ במקום הנכון";
  }
  if (!clean.slice(at + 1).includes(".")) {
    return "חסר דומיין תקין";
  }
  return null;
}

console.log(validateEmail("  dana@mail.com "));
console.log(validateEmail("dana@mail"));

module.exports = { validateEmail };
