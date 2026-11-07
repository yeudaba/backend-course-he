// P08-E06: ייבא את formatPrice ו־formatLine מהקובץ P08-E06-format.js
// (כתוב כאן את שורת ה־require)

// receipt([{ name: "עט", price: 5 }, { name: "מחברת", price: 12.5 }])
// → "עט: ₪5.00\nמחברת: ₪12.50\nסה״כ: ₪17.50"
function receipt(items) {
  // כתוב כאן
}

console.log(receipt([{ name: "עט", price: 5 }, { name: "מחברת", price: 12.5 }]));

module.exports = { receipt };
