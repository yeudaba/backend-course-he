// P06-E21: שלושה באגים של callbacks
// doublePrices([5, 10]) → [10, 20]
function doublePrices(prices) {
  return prices.map((p) => {
    p * 2;
  });
}

// activeUsers(["active", "blocked", "active"]) → ["active", "active"]
function activeUsers(statuses) {
  return statuses.filter((s) => s);
}

// shout(["hi", "bye"]) → ["HI", "BYE"]
function shout(words) {
  return words.forEach((w) => w.toUpperCase());
}

console.log(doublePrices([5, 10]), activeUsers(["active", "blocked"]), shout(["hi"]));

module.exports = { doublePrices, activeUsers, shout };
