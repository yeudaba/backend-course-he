// P06-E21: callbacks — מתוקן
function doublePrices(prices) {
  return prices.map((p) => p * 2);
}

function activeUsers(statuses) {
  return statuses.filter((s) => s === "active");
}

function shout(words) {
  return words.map((w) => w.toUpperCase());
}

console.log(doublePrices([5, 10]), activeUsers(["active", "blocked", "active"]), shout(["hi"]));

module.exports = { doublePrices, activeUsers, shout };
