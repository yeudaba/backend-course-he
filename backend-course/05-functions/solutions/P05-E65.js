function makeFormatter(currency = "₪", decimals = 2) {
  return (amount) => `${currency}${amount.toFixed(decimals)}`;
}

const shekels = makeFormatter();
const rounded = makeFormatter("€", 0);
console.log(shekels(19.9), rounded(19.9));

module.exports = { makeFormatter };
