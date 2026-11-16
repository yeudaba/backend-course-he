// P29-E53: ממילים חופשיות ל־enum
export function toEnum<T extends string>(value: unknown, allowed: readonly T[], synonyms: Record<string, T> = {}): T | null {
  if (typeof value !== "string") return null;
  const n = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if ((allowed as readonly string[]).includes(n)) return n as T;
  if (Object.hasOwn(synonyms, n)) return synonyms[n];
  return null;
}
