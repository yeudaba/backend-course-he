async function totalStock(codes, getStock) {
  let total = 0;
  for (let i = 0; i < codes.length; i += 2) {
    const part = await Promise.all(codes.slice(i, i + 2).map((c) => getStock(c)));
    total += part.reduce((s, n) => s + n, 0);
  }
  return total;
}
module.exports = { totalStock };
