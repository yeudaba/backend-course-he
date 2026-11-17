// P27-E35: מה חסר?
export function missing<T>(expected: T[], actual: T[]): T[] {
  const have = new Set(actual);
  return expected.filter((x) => !have.has(x));
}
