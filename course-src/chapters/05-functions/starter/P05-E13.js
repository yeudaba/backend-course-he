// P05-E13: בדיקת אימייל. מחזירה את הודעת השגיאה הראשונה, או null אם תקין.
// (הבדיקות נעשות אחרי trim)
// 1. ריק                                  → "חובה להזין אימייל"
// 2. יש רווח באמצע                        → "אימייל לא יכול להכיל רווחים"
// 3. אין @, או @ בהתחלה/בסוף              → "חסר @ במקום הנכון"
// 4. אין נקודה אחרי ה־@                   → "חסר דומיין תקין"
function validateEmail(email) {
  // כתוב כאן
}

console.log(validateEmail("  dana@mail.com ")); // null
console.log(validateEmail("dana@mail")); // "חסר דומיין תקין"

module.exports = { validateEmail };
