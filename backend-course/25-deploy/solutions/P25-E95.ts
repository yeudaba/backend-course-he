// P25-E95: JWT_SECRET לפרודקשן
import { randomBytes } from "node:crypto";

export function generateSecret(bytes = 48): string {
  if (bytes < 32) throw new RangeError("לפחות 32 בתים");
  return randomBytes(bytes).toString("base64url");
}

export function secretProblems(secret: string): string[] {
  const problems: string[] = [];
  if (secret.length < 32) problems.push("too-short");
  if (secret !== secret.trim()) problems.push("whitespace");
  if (/change-?me|secret|password|example|dev-only/i.test(secret)) problems.push("placeholder");
  if (new Set(secret).size < 10) problems.push("low-variety");
  return problems;
}
