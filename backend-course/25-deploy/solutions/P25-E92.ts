// P25-E92: ה־README של פרויקט 2
export function readmeProblems(md: string, { user, repo, liveUrl }: { user: string; repo: string; liveUrl: string }): string[] {
  const lines = md.split("\n");
  const problems: string[] = [];
  const badge = `![CI](https://github.com/${user}/${repo}/actions/workflows/ci.yml/badge.svg)`;
  if (!lines.slice(0, 5).some((l) => l.includes(badge))) problems.push("badge");
  if (!md.includes(`${liveUrl.replace(/\/+$/, "")}/docs`)) problems.push("live-link");
  if (!lines.some((l) => l.includes("NestJS") && l.includes("PostgreSQL") && l.includes("Docker"))) problems.push("architecture");
  if (/YOUR-(USER|SERVICE)/.test(md)) problems.push("placeholder");
  return problems;
}
