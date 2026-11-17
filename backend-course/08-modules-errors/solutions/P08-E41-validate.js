function orderErrors(order) {
  const errors = [];
  if (!order.email.includes("@")) {
    errors.push("אימייל לא תקין");
  }
  if (order.items.length === 0) {
    errors.push("הזמנה ריקה");
  }
  if (order.items.some((i) => !Number.isInteger(i.qty) || i.qty < 1)) {
    errors.push("כמות לא תקינה");
  }
  return errors;
}

module.exports = { orderErrors };
