// P10-E08
function legacyGetPrice(code, callback) {
  const prices = { "KB-101": 199, "MS-201": 89 };
  setTimeout(() => {
    if (code in prices) {
      callback(null, prices[code]);
    } else {
      callback(new Error(`אין מחיר ל־${code}`));
    }
  }, 5);
}

function getPrice(code) {
  return new Promise((resolve, reject) => {
    legacyGetPrice(code, (err, price) => {
      if (err) {
        reject(err);
      } else {
        resolve(price);
      }
    });
  });
}

getPrice("KB-101").then((p) => console.log(p));

module.exports = { legacyGetPrice, getPrice };
