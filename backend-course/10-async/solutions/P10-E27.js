// P10-E27: סכום הזמנה במקביל
async function orderTotal(items, getPrice) {
  const prices = await Promise.all(items.map(({ sku }) => getPrice(sku)));
  return prices.reduce((sum, price, i) => sum + price * items[i].qty, 0);
}

const catalog = { A: 10, B: 25 };
const getPrice = (sku) => new Promise((resolve) => setTimeout(() => resolve(catalog[sku]), 50));

const start = Date.now();
orderTotal([{ sku: "A", qty: 3 }, { sku: "B", qty: 2 }], getPrice).then((total) => {
  console.log(total, Date.now() - start < 90 ? "במקביל" : "אחד אחרי השני");
});

module.exports = { orderTotal };
