// P30-E41: מה צריך להיות ב־.gitignore
const RISKY_DIRS = new Set(["node_modules", "dist", "coverage"]);

function risky(p: string): boolean {
  const parts = p.split("/");
  const name = parts.at(-1)!;
  if (parts.some((s) => RISKY_DIRS.has(s))) return true;
  if ((name === ".env" || name.startsWith(".env.")) && name !== ".env.example") return true;
  return name.endsWith(".pem") || name.endsWith(".key");
}

function matches(pattern: string, p: string): boolean {
  const parts = p.split("/");
  const name = parts.at(-1)!;
  if (pattern.endsWith("/")) return parts.slice(0, -1).includes(pattern.slice(0, -1));
  if (pattern.startsWith("/")) return p === pattern.slice(1) || p.startsWith(pattern.slice(1) + "/");
  if (pattern.startsWith("*.")) return name.endsWith(pattern.slice(1));
  if (pattern === ".env*") return name.startsWith(".env");
  return parts.includes(pattern);
}

export function unignoredRisks(gitignore: string, paths: string[]): string[] {
  const patterns = gitignore
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  return paths.filter((p) => risky(p) && !patterns.some((pat) => matches(pat, p)));
}
