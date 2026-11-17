function countBy(list, keyFn) {
  const counts = {};
  for (const item of list) {
    const key = keyFn(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function topKeys(counts, n) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([key]) => key);
}

const orders = [{ city: "חיפה" }, { city: "אילת" }, { city: "חיפה" }, { city: "באר שבע" }];
const counts = countBy(orders, (o) => o.city);
console.log(counts, topKeys(counts, 2));

module.exports = { countBy, topKeys };
