// P08-E21: שלוש פונקציות, שלוש טעויות בטיפול בשגיאות
// parseAge: מחזירה גיל (שלם, 0 ומעלה) או זורקת Error(`גיל לא תקין: ${text}`)
function parseAge(text) {
  try {
    const age = Number(text);
    if (!Number.isInteger(age) || age < 0) {
      throw new Error(`גיל לא תקין: ${text}`);
    }
    return age;
  } catch (err) {}
}

// ageOrNull: הגיל, או null אם לא תקין
function ageOrNull(text) {
  try {
    return parseAge(text);
  } catch (err) {
    console.log("שגיאה:", err.message);
  }
}

// strictAge: הגיל, או זורקת (כמו parseAge), ותמיד מדפיסה "נבדק: ..."
function strictAge(text) {
  let age;
  try {
    age = Number(text);
    return parseAge(text);
  } finally {
    console.log(`נבדק: ${text}`);
    return age;
  }
}

module.exports = { parseAge, ageOrNull, strictAge };
