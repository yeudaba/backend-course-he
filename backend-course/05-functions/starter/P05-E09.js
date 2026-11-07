// P05-E09: פונקציות שמחזירות בוליאני — בלי if, רק return של ביטוי
function isAdult(age) {
  // 18 ומעלה
}

function isWeekend(day) {
  // day: 1–7, כש־1 הוא ראשון. סופ״ש = 6 או 7
}

function canRent(age, hasLicense) {
  // 21 ומעלה, ויש רישיון
}

console.log(isAdult(18), isWeekend(3), canRent(25, true));

module.exports = { isAdult, isWeekend, canRent };
