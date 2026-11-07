// P06-E20: שלושה באגים.
// summarize([100, 250, 40]) → "3 מכירות, סה״כ 390, הגדולה ביותר 250"
// summarize([-20, -5])      → "2 מכירות, סה״כ -25, הגדולה ביותר -5"
// summarize([])             → "אין מכירות"
function summarize(sales) {
  let total = 0;
  let best = 0;
  for (let i = 0; i < sales.length - 1; i++) {
    total += sales[i];
    if (sales[i] > best) {
      best = sales[i];
    }
  }
  return `${sales.length} מכירות, סה״כ ${total}, הגדולה ביותר ${best}`;
}

console.log(summarize([100, 250, 40]));

module.exports = { summarize };
