// P13-E34: איזה סוג טווח?
export function rangeKind(range) {
  const m = String(range).trim().match(/^([~^]?)\d+\.\d+\.\d+$/);
  if (!m) return "other";
  if (m[1] === "^") return "caret";
  if (m[1] === "~") return "tilde";
  return "exact";
}

export function countKinds(deps) {
  const counts = { caret: 0, tilde: 0, exact: 0, other: 0 };
  for (const range of Object.values(deps)) counts[rangeKind(range)]++;
  return counts;
}

console.log(["^1.2.3", "~1.2.3", "1.2.3", "1.2", "latest", " ^4.18.2 "].map(rangeKind));
console.log(countKinds({ express: "^5.1.0", zod: "4.1.5", pg: "~8.16.0", old: "*" }));
