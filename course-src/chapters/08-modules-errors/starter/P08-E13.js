// P08-E13
// מחזירה (לא זורקת!) Error עם message, field, code = "VALIDATION", status = 400
function validationError(field, message) {
  // כתוב כאן
}

// זורקת את השגיאה הראשונה, מחזירה true אם תקין:
//   email בלי @ (או לא מחרוזת)       → field "email",    "אימייל לא תקין"
//   password קצרה מ־8 (או לא מחרוזת) → field "password", "סיסמה קצרה מדי"
//   age קיים ולא שלם או קטן מ־13      → field "age",      "גיל מינימלי 13"
function validateSignup({ email, password, age }) {
  // כתוב כאן
}

module.exports = { validationError, validateSignup };
