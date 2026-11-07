// P13-E13
const parse = (v) => v.split(".").map(Number);

export function compareVersions(a, b) {
  const x = parse(a);
  const y = parse(b);
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] - y[i];
  }
  return 0;
}

export function satisfies(version, range) {
  const op = range[0];
  if (op !== "^" && op !== "~") return compareVersions(version, range) === 0;
  const min = range.slice(1);
  if (compareVersions(version, min) < 0) return false;
  const [vMaj, vMin] = parse(version);
  const [mMaj, mMin] = parse(min);
  return op === "^" ? vMaj === mMaj : vMaj === mMaj && vMin === mMin;
}

export function maxSatisfying(versions, range) {
  const ok = versions.filter((v) => satisfies(v, range)).sort(compareVersions);
  return ok.at(-1) ?? null;
}

const available = ["4.17.1", "4.18.2", "4.21.0", "5.0.0", "5.1.0"];
console.log(maxSatisfying(available, "^4.18.0"), maxSatisfying(available, "~4.18.0"), maxSatisfying(available, "^6.0.0"));
