function sumPrices(pricesText) { let total = 0; for (const p of pricesText.split(",")) total += parseInt(p); return total; }
module.exports = { sumPrices };
