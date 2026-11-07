// P05-E20: הקובץ "עובד" כשמריצים — אבל הבודק נכשל. שלוש פונקציות, שלושה באגים.
// discountPrice(200, 10) → 180
// addShipping(180) → 205
// finalPrice(200, 10) → 205
function discountPrice(price, percent) {
  console.log(price - (price * percent) / 100);
}

const addShipping = (total) => {
  total + 25;
};

function finalPrice(price, percent) {
  return
    addShipping(discountPrice(price, percent));
}

discountPrice(200, 10);
console.log(addShipping(180));
console.log(finalPrice(200, 10));

module.exports = { discountPrice, addShipping, finalPrice };
