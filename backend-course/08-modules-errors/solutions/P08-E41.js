const { orderErrors } = require("./P08-E41-validate");

function splitOrders(orders) {
  const valid = [];
  const invalid = [];
  for (const o of orders) {
    const errors = orderErrors(o);
    if (errors.length === 0) {
      valid.push(o.id);
    } else {
      invalid.push({ id: o.id, errors });
    }
  }
  return { valid, invalid };
}

module.exports = { splitOrders };
