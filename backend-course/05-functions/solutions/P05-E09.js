// P05-E09: פונקציות שמחזירות בוליאני
function isAdult(age) {
  return age >= 18;
}

function isWeekend(day) {
  return day === 6 || day === 7;
}

function canRent(age, hasLicense) {
  return age >= 21 && hasLicense;
}

console.log(isAdult(18), isWeekend(3), canRent(25, true));

module.exports = { isAdult, isWeekend, canRent };
