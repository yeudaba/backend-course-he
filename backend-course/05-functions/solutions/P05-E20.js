// P05-E20: שלוש פונקציות — מתוקנות
function discountPrice(price, percent) {
  return price - (price * percent) / 100;
}

const addShipping = (total) => {
  return total + 25;
};

function finalPrice(price, percent) {
  return addShipping(discountPrice(price, percent));
}

console.log(finalPrice(200, 10));

module.exports = { discountPrice, addShipping, finalPrice };
