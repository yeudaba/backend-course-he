// P06-E22: מיון בלי תופעות לוואי
function cheapestThree(prices) {
  return [...prices].sort((a, b) => a - b).slice(0, 3);
}

function firstListed(prices) {
  return prices[0];
}

const catalog = [120, 15, 9, 300, 45];
console.log(cheapestThree(catalog), firstListed(catalog));

module.exports = { cheapestThree, firstListed };
