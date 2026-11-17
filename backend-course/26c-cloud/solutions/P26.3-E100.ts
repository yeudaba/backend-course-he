// P26.3-E100: הגרסה הבאה מתוך ה־commits
export function nextVersion(current: string, commits: string[]): string | null {
  const v = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!v) throw new Error(`גרסה לא תקינה: ${current}`);
  let [major, minor, patch] = v.slice(1).map(Number);
  let level = 0;
  for (const c of commits) {
    const [first, ...rest] = c.split("\n");
    const m = /^(\w+)(?:\([^)]*\))?(!)?:/.exec(first);
    if (!m) continue;
    if (m[2] || rest.some((l) => l.startsWith("BREAKING CHANGE:"))) level = Math.max(level, 3);
    else if (m[1] === "feat") level = Math.max(level, 2);
    else if (m[1] === "fix" || m[1] === "perf") level = Math.max(level, 1);
  }
  if (level === 0) return null;
  if (level === 3) [major, minor, patch] = [major + 1, 0, 0];
  else if (level === 2) [minor, patch] = [minor + 1, 0];
  else patch++;
  return `${major}.${minor}.${patch}`;
}
