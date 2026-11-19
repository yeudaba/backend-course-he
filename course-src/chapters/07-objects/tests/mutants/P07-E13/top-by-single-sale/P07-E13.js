function totalsByCategory(sales) { const r = {}; for (const { category, amount } of sales) r[category] = (r[category] ?? 0) + amount; return r; }
function countByStatus(orders) { const r = {}; for (const o of orders) r[o.status] = (r[o.status] ?? 0) + 1; return r; }
function topCategory(sales) { if (sales.length === 0) return null; return sales.reduce((a, b) => (b.amount > a.amount ? b : a)).category; }
module.exports = { totalsByCategory, countByStatus, topCategory };
