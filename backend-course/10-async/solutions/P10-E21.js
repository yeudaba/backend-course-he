// P10-E21: מתוקן
const wait = (v, ms = 5) => new Promise((r) => setTimeout(() => r(v), ms));
const getPrice = (code) => wait({ "KB-101": 199 }[code] ?? null);
const getShipping = (price) => wait(price >= 200 ? 0 : 25);

function priceWithShipping(code) {
  return getPrice(code)
    .then((price) => {
      if (price === null) {
        throw new Error("מוצר לא קיים");
      }
      return getShipping(price).then((shipping) => price + shipping);
    });
}

priceWithShipping("KB-101").then(console.log);

module.exports = { priceWithShipping };
