function countByMonth(orders) {
  const counts = {};
  for (const o of orders) {
    const d = new Date(o.createdAt);
    if (Number.isNaN(d.getTime())) {
      continue;
    }
    const month = d.toISOString().slice(0, 7);
    counts[month] = (counts[month] ?? 0) + 1;
  }
  return counts;
}

const orders = [
  { id: 1, createdAt: "2026-03-05T10:00:00Z" },
  { id: 2, createdAt: "2026-03-31T23:30:00Z" },
  { id: 3, createdAt: "2026-04-01T00:10:00+02:00" },
  { id: 4, createdAt: "לא ידוע" },
  { id: 5, createdAt: "2026-04-01T09:00:00Z" },
];
console.log(countByMonth(orders));

module.exports = { countByMonth };
