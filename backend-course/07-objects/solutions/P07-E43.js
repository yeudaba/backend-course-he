function applyCoupon(total, code, coupons) {
  const percent = coupons[code.trim().toUpperCase()];
  if (percent === undefined) {
    return total;
  }
  return Math.round(total * (1 - percent / 100) * 100) / 100;
}

const coupons = { SALE10: 10, VIP: 25 };
console.log(applyCoupon(200, " sale10 ", coupons), applyCoupon(99.9, "VIP", coupons), applyCoupon(50, "NOPE", coupons));

module.exports = { applyCoupon };
