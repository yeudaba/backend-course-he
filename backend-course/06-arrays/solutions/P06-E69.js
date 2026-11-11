function isValidCoupon(code) {
  const clean = code.trim().toUpperCase();
  if (clean.length !== 8 || !clean.startsWith("IL")) {
    return false;
  }
  return clean
    .slice(2)
    .split("")
    .every((ch) => ch >= "0" && ch <= "9");
}

function validCoupons(codes) {
  return codes.map((c) => c.trim().toUpperCase()).filter(isValidCoupon);
}

console.log(validCoupons([" il123456", "IL12345", "IL12a456", "XX123456", "IL000001 "]));

module.exports = { isValidCoupon, validCoupons };
