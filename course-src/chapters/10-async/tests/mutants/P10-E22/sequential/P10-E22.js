async function totalStock(codes, getStock) {
  let total = 0;
  for (const code of codes) total += await getStock(code);
  return total;
}
module.exports = { totalStock };
