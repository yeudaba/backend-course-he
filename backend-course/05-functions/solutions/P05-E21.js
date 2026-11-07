// P05-E21: סכום עגלה — פונקציה טהורה
function sumPrices(pricesText) {
  let total = 0;
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

console.log(sumPrices("10,20,30"));
console.log(sumPrices("10,20,30"));

module.exports = { sumPrices };
