function totalsByCategory(sales) { const r = {}; for (const { category, amount } of sales) r[category] = (r[category] ?? 0) + amount; return r; }
function countByStatus(orders) { const r = {}; for (const o of orders) r[o.status] = (r[o.status] ?? 0) + 1; return r; }
function topCategory(sales) { let best = null, max = 0; for (const [c, t] of Object.entries(totalsByCategory(sales))) if (t > max) { best = c; max = t; } return best; }
module.exports = { totalsByCategory, countByStatus, topCategory };
