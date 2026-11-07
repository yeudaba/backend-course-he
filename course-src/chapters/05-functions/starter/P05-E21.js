// P05-E21: סכום מחירים מטקסט כמו "10,20,30". הקריאה השנייה נותנת תוצאה שגויה!
let total = 0;

function sumPrices(pricesText) {
  let current = "";
  for (const ch of pricesText + ",") {
    if (ch === ",") {
      total += Number(current);
      current = "";
    } else {
      current += ch;
    }
  }
  return total;
}

console.log(sumPrices("10,20,30")); // 60
console.log(sumPrices("10,20,30")); // צריך להיות 60 שוב

module.exports = { sumPrices };
