// P08-E19: מנגנון בדיקות מינימלי
function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: ציפינו ל־${expected} וקיבלנו ${actual}`);
  }
}

function runChecks(checks) {
  const passed = [];
  const failed = [];
  for (const { name, fn } of checks) {
    try {
      fn();
      passed.push(name);
    } catch (err) {
      failed.push({ name, error: err.message });
    }
  }
  return { passed, failed };
}

const double = (n) => n + n;
console.log(
  runChecks([
    { name: "double(2)", fn: () => assertEqual(double(2), 4, "double(2)") },
    { name: "double(0.1)", fn: () => assertEqual(double(0.1), 0.2, "double(0.1)") },
    { name: "string", fn: () => assertEqual(double("a"), 2, "double('a')") },
  ])
);

module.exports = { assertEqual, runChecks };
