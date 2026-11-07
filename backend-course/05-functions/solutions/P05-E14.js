// P05-E14: עלות משלוח לפי משקל
function shippingCost(weight) {
  if (typeof weight !== "number" || Number.isNaN(weight) || weight <= 0) {
    return null;
  }
  if (weight <= 1) {
    return 25;
  }
  if (weight <= 5) {
    return 40;
  }
  if (weight <= 20) {
    return 70;
  }
  return 70 + Math.ceil(weight - 20) * 5;
}

console.log(shippingCost(23.4), shippingCost(1), shippingCost(-2));

module.exports = { shippingCost };
