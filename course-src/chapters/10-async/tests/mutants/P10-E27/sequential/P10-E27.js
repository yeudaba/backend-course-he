async function orderTotal(items, getPrice) {
  let total = 0;
  for (const { sku, qty } of items) total += (await getPrice(sku)) * qty;
  return total;
}
module.exports = { orderTotal };
