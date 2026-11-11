// P25-E26 — feature flags עם פריסה הדרגתית
import { createHash } from "node:crypto";

export type Flag = { enabled: boolean; percent: number; allow?: string[] };

export function bucketOf(flagName: string, userId: string): number {
  const digest = createHash("sha256").update(`${flagName}:${userId}`).digest();
  return digest.readUInt32BE(0) % 100;
}

export function isEnabled(flags: Record<string, Flag>, flagName: string, userId: string): boolean {
  const flag = flags[flagName];
  if (!flag || !flag.enabled) return false;
  if (flag.allow?.includes(userId)) return true;
  return bucketOf(flagName, userId) < flag.percent;
}

const flags: Record<string, Flag> = {
  "new-checkout": { enabled: true, percent: 10, allow: ["qa-1"] },
  "dark-mode": { enabled: false, percent: 100 },
};
console.log(bucketOf("new-checkout", "user-1"), bucketOf("new-checkout", "user-2"), bucketOf("dark-mode", "user-1"));
console.log(isEnabled(flags, "new-checkout", "qa-1"), isEnabled(flags, "dark-mode", "user-1"), isEnabled(flags, "nope", "user-1"));
let on = 0;
for (let i = 0; i < 10_000; i++) if (isEnabled(flags, "new-checkout", `user-${i}`)) on++;
console.log(`${on} מתוך 10,000`);
