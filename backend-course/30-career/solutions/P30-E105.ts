// P30-E105: מה השתנה בתלויות
type Pkg = { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

const all = (p: Pkg): Record<string, string> => ({ ...p.dependencies, ...p.devDependencies });
const majorOf = (range: string) => /\d+/.exec(range)?.[0];

export function depChanges(before: Pkg, after: Pkg) {
  const a = all(before);
  const b = all(after);
  const added = Object.keys(b).filter((n) => !Object.hasOwn(a, n)).sort().map((n) => `${n}@${b[n]}`);
  const removed = Object.keys(a).filter((n) => !Object.hasOwn(b, n)).sort();
  const major = Object.keys(b)
    .filter((n) => Object.hasOwn(a, n))
    .sort()
    .flatMap((n) => {
      const x = majorOf(a[n]);
      const y = majorOf(b[n]);
      return x !== undefined && y !== undefined && x !== y ? [`${n}: ${x} → ${y}`] : [];
    });
  return { added, removed, major, needsReview: added.length > 0 || major.length > 0 };
}
