// P10-E22: מתוקן
async function totalStock(codes, getStock) {
  const stocks = await Promise.all(codes.map((code) => getStock(code)));
  return stocks.reduce((sum, n) => sum + n, 0);
}

const fake = (code) => new Promise((r) => setTimeout(() => r(code.length), 10));
totalStock(["a", "bb", "ccc"], fake).then(console.log);

module.exports = { totalStock };
