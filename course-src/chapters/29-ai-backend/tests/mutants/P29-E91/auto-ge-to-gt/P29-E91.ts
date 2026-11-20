// P29-E91: להשוות שתי הרצות eval
type Result = { name: string; passed: boolean };

const score = (rs: Result[]) => (rs.length === 0 ? 0 : Math.round((rs.filter((r) => r.passed).length / rs.length) * 100) / 100);

export function compareEvals(before: Result[], after: Result[]) {
  const beforeBy = new Map(before.map((r) => [r.name, r.passed]));
  const afterBy = new Map(after.map((r) => [r.name, r.passed]));
  const regressions = before.filter((r) => r.passed && afterBy.get(r.name) === false).map((r) => r.name);
  const fixed = after.filter((r) => r.passed && beforeBy.get(r.name) === false).map((r) => r.name);
  const missing = before.filter((r) => !afterBy.has(r.name)).map((r) => r.name);
  const b = score(before);
  const a = score(after);
  return { before: b, after: a, regressions, fixed, missing, ok: regressions.length === 0 && missing.length === 0 && a > b };
}
