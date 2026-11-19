const DAY = 24 * 60 * 60 * 1000;

function addDays(day, n) {
  const start = new Date(day + "T00:00:00Z");
  if (Number.isNaN(start.getTime())) {
    return null;
  }
  return new Date(start.getTime() + n * DAY).toISOString().slice(0, 10);
}

console.log(addDays("2026-02-27", 3), addDays("2026-12-30", 5), addDays("2026-03-10", -10), addDays("abc", 1));

module.exports = { addDays };
