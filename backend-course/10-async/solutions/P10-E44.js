// P10-E44: מנבא ה־event loop
function predictOrder(steps) {
  const sync = [];
  const micro = [];
  const timers = [];
  for (const step of steps) {
    switch (step.kind) {
      case "sync":
        sync.push(step.label);
        break;
      case "promise":
        micro.push(step.label);
        break;
      case "timeout":
        timers.push(step);
        break;
      default:
        throw new Error(`סוג לא מוכר: ${step.kind}`);
    }
  }
  timers.sort((a, b) => a.ms - b.ms);
  return [...sync, ...micro, ...timers.map((t) => t.label)];
}

console.log(predictOrder([
  { kind: "sync", label: "1" },
  { kind: "timeout", label: "timeout", ms: 0 },
  { kind: "promise", label: "promise" },
  { kind: "sync", label: "2" },
]));

module.exports = { predictOrder };
