// P05-E15: שנה מעוברת וימים בחודש
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(month, year) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if (month === 4 || month === 6 || month === 9 || month === 11) {
    return 30;
  }
  return 31;
}

console.log(daysInMonth(2, 2024), daysInMonth(2, 1900), daysInMonth(4, 2025), daysInMonth(13, 2025));

module.exports = { isLeapYear, daysInMonth };
