// P05-E81: דמי משלוח — מתוקן
function shippingFee(total, isMember = false) {
  if (typeof total !== "number" || total < 0) {
    return null;
  }
  if (isMember) return 0;
  if (total >= 200) return 0;
  return 25;
}

console.log(shippingFee(100), shippingFee(100, true), shippingFee(200), shippingFee(-5), shippingFee("abc"));

module.exports = { shippingFee };
