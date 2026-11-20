const DAY = 24 * 60 * 60 * 1000;

function daysBetween(fromIso, toIso) {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return null;
  }
  return Math.floor((to.getTime() - from.getTime()) / DAY);
}

console.log(daysBetween("2026-11-01T10:00:00Z", "2026-11-19T10:00:00Z"));
console.log(daysBetween("2026-11-01T10:00:00Z", "2026-11-19T09:00:00Z"));
console.log(daysBetween("2026-11-19T10:00:00Z", "2026-11-01T10:00:00Z"));
console.log(daysBetween("2026-11-01T10:00:00Z", "מחר"));

module.exports = { daysBetween };
