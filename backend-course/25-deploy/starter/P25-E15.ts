// P25-E15: הגרסה הבאה לפי ה־commits (Conventional Commits + SemVer)
export function nextVersion(current: string, commits: string[]): { version: string; bump: "major" | "minor" | "patch" | "none"; notes: string } {
  return { version: current, bump: "none", notes: "" }; // כתוב כאן
}
