// P27-E33: כפילויות לפי email — O(n)
export function dedupeByEmail<T extends { email: string }>(users: T[]): T[] {
  const seen = new Set<string>();
  return users.filter((u) => {
    const key = u.email.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
