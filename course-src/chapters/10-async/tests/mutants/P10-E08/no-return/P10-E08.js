function legacyGetPrice(code, callback) {
  const prices = { "KB-101": 199, "MS-201": 89 };
  setTimeout(() => (prices[code] !== undefined ? callback(null, prices[code]) : callback(new Error(`אין מחיר ל־${code}`))), 5);
}
function getPrice(code) {
  new Promise((resolve, reject) => legacyGetPrice(code, (err, price) => (err ? reject(err) : resolve(price))));
}
module.exports = { legacyGetPrice, getPrice };
