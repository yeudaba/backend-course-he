// P25-E51: סורק סודות
const RULES: [string, (line: string) => boolean][] = [
  ["github-token", (l) => /ghp_[A-Za-z0-9]{36}/.test(l)],
  ["aws-access-key", (l) => /AKIA[0-9A-Z]{16}/.test(l)],
  ["private-key", (l) => /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(l)],
  ["database-url", (l) => {
    const m = /postgres(?:ql)?:\/\/[^:\s/@]+:([^@\s]+)@/.exec(l);
    return m !== null && m[1] !== "***";
  }],
  ["jwt-secret", (l) => /JWT_SECRET\s*[=:]\s*["']?[^\s"']{16,}/.test(l)],
];

export function findSecrets(text: string): { line: number; kind: string }[] {
  const found: { line: number; kind: string }[] = [];
  text.split("\n").forEach((line, i) => {
    if (line.includes("secret-scan: ignore")) return;
    for (const [kind, test] of RULES) if (test(line)) found.push({ line: i + 1, kind });
  });
  return found;
}

console.log(findSecrets(`DATABASE_URL=postgresql://neondb_owner:npg_8f3kQ1xYz@ep-cool.neon.tech/neondb?sslmode=require
REDACTED=postgresql://neondb_owner:***@ep-cool.neon.tech/neondb
JWT_SECRET=dev-only-secret-not-for-production!!   # secret-scan: ignore
JWT_SECRET: "k2Jd8sLq0pWz7xYvB4nM"`));
