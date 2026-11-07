// P10-E22: מחזירה תמיד 0. getStock(code) מחזירה Promise של מספר.
async function totalStock(codes, getStock) {
  let total = 0;
  codes.forEach(async (code) => {
    total += await getStock(code);
  });
  return total;
}

module.exports = { totalStock };
