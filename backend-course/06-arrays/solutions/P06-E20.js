// P06-E20: סיכום מכירות — מתוקן
function summarize(sales) {
  if (sales.length === 0) {
    return "אין מכירות";
  }
  let total = 0;
  let best = sales[0];
  for (const s of sales) {
    total += s;
    if (s > best) {
      best = s;
    }
  }
  return `${sales.length} מכירות, סה״כ ${total}, הגדולה ביותר ${best}`;
}

console.log(summarize([100, 250, 40]));
console.log(summarize([-20, -5]));

module.exports = { summarize };
