function isTime(text) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text);
}

function digitsOnly(phone) {
  return phone.replace(/\D/g, "");
}

function firstNumber(text) {
  const m = text.match(/\d+/);
  return m === null ? null : Number(m[0]);
}

console.log(isTime("08:30"), isTime("24:00"), isTime("08:300"));
console.log(digitsOnly("052-123-4567"), digitsOnly("+972 (52) 123-4567"));
console.log(firstNumber("הזמנה 42, 3 פריטים"), firstNumber("אין"));

module.exports = { isTime, digitsOnly, firstNumber };
