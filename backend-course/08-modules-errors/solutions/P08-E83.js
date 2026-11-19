function isMobile(text) {
  return /^05\d-?\d{7}$/.test(text);
}

function isPostalCode(text) {
  return /^\d{7}$/.test(text);
}

function isUsername(text) {
  return /^[a-z][a-z0-9_]{2,15}$/.test(text);
}

console.log(isMobile("052-1234567"), isMobile("052-123456"), isPostalCode("6100000"), isUsername("dana_2026"), isUsername("2dana"));

module.exports = { isMobile, isPostalCode, isUsername };
