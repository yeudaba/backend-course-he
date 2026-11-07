// P13-E06
export function parseVersion(v) {
  const parts = String(v).split(".");
  if (parts.length !== 3 || !parts.every((p) => /^\d+$/.test(p))) {
    throw new Error(`גרסה לא תקינה: ${v}`);
  }
  return parts.map(Number);
}

function compare(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

export function satisfiesCaret(version, range) {
  const v = parseVersion(version);
  const min = parseVersion(range.replace(/^\^/, ""));
  if (compare(v, min) < 0) return false;
  if (min[0] === 0) return v[0] === 0 && v[1] === min[1];
  return v[0] === min[0];
}

console.log(satisfiesCaret("1.9.0", "^1.2.3"), satisfiesCaret("2.0.0", "^1.2.3"), satisfiesCaret("0.3.0", "^0.2.3"));
