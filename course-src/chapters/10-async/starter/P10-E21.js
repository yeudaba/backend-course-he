// P10-E21: שני באגים. priceWithShipping("KB-101") → Promise של 224
// מוצר לא קיים → Promise שנכשל עם Error("מוצר לא קיים")
const wait = (v, ms = 5) => new Promise((r) => setTimeout(() => r(v), ms));
const getPrice = (code) => wait({ "KB-101": 199 }[code] ?? null);
const getShipping = (price) => wait(price >= 200 ? 0 : 25);

function priceWithShipping(code) {
  getPrice(code).then((price) => {
    if (price === null) {
      throw new Error("מוצר לא קיים");
    }
    getShipping(price).then((shipping) => price + shipping);
  });
}

module.exports = { priceWithShipping };
