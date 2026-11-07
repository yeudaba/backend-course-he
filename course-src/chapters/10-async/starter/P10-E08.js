// P10-E08: אל תשנה את legacyGetPrice
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

// מחזירה Promise של המחיר
function getPrice(code) {
  // כתוב כאן
}

module.exports = { legacyGetPrice, getPrice };
