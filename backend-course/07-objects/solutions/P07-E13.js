// P07-E13: קיבוץ (group by)
function totalsByCategory(sales) {
  const result = {};
  for (const { category, amount } of sales) {
    result[category] = (result[category] ?? 0) + amount;
  }
  return result;
}

function countByStatus(orders) {
  const result = {};
  for (const order of orders) {
    result[order.status] = (result[order.status] ?? 0) + 1;
  }
  return result;
}

function topCategory(sales) {
  let best = null;
  let bestTotal = -Infinity;
  for (const [category, total] of Object.entries(totalsByCategory(sales))) {
    if (total > bestTotal) {
      best = category;
      bestTotal = total;
    }
  }
  return best;
}

const sales = [
  { category: "ספרים", amount: 80 },
  { category: "מחשבים", amount: 1200 },
  { category: "ספרים", amount: 45 },
];
console.log(totalsByCategory(sales), topCategory(sales));

module.exports = { totalsByCategory, countByStatus, topCategory };
