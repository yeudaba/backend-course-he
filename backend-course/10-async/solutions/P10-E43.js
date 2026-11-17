// P10-E43: סדר הטיימרים — בלי להריץ אותם
function timerOrder(timers) {
  return [...timers].sort((a, b) => a.ms - b.ms).map((t) => t.label);
}

const timers = [
  { label: "A", ms: 100 },
  { label: "B", ms: 0 },
  { label: "C", ms: 50 },
  { label: "D", ms: 0 },
];
console.log(timerOrder(timers));
console.log(timers[0].label); // המקור לא השתנה

module.exports = { timerOrder };
