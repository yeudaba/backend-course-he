// P30-E33 — האם הגרסה מתאימה לטווח? (semver: ^, ~, >=, <, מדויק)
type Version = [number, number, number];

function parse(text: string): Version {
  const m = text.trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new SyntaxError(`גרסה לא תקינה: ${text}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function compare(a: string, b: string): number {
  const x = parse(a);
  const y = parse(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return Math.sign(x[i] - y[i]);
  return 0;
}

function upperBound(op: "^" | "~", [major, minor, patch]: Version): string {
  if (op === "~") return `${major}.${minor + 1}.0`;
  if (major > 0) return `${major + 1}.0.0`;
  if (minor > 0) return `0.${minor + 1}.0`;
  return `0.0.${patch + 1}`;
}

function satisfiesOne(version: string, part: string): boolean {
  const m = part.match(/^(\^|~|>=|<=|>|<|=)?\s*(.+)$/);
  if (!m) throw new SyntaxError(`טווח לא תקין: ${part}`);
  const [, op = "=", base] = m;
  const c = compare(version, base);
  switch (op) {
    case "=":
      return c === 0;
    case ">":
      return c > 0;
    case ">=":
      return c >= 0;
    case "<":
      return c < 0;
    case "<=":
      return c <= 0;
    case "^":
    case "~":
      return c >= 0 && compare(version, upperBound(op, parse(base))) < 0;
    default:
      throw new SyntaxError(`אופרטור לא מוכר: ${op}`);
  }
}

export function satisfies(version: string, range: string): boolean {
  return range.trim().split(/\s+/).every((part) => satisfiesOne(version, part));
}

const cases: [string, string][] = [
  ["5.1.2", "^5.0.0"],
  ["6.0.0", "^5.0.0"],
  ["0.3.9", "^0.3.1"],
  ["0.4.0", "^0.3.1"],
  ["1.4.9", "~1.4.2"],
  ["1.5.0", "~1.4.2"],
  ["22.11.0", ">=20.0.0 <23.0.0"],
  ["v24.1.0", ">=20.0.0 <23.0.0"],
];
for (const [v, r] of cases) console.log(v.padEnd(8), r.padEnd(18), satisfies(v, r));
