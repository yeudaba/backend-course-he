// P28.5-E93: כמה הנתונים ישנים?
function label(lagMs: number): string {
  const s = Math.floor(lagMs / 1000);
  if (s < 60) return `${s}s`;
  if (s <= 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export function freshness(lastSyncAt: string | null, now: number, intervalMs: number) {
  if (lastSyncAt === null) return { status: "broken" as const, lagMs: null, label: "never" };
  const lagMs = now - Date.parse(lastSyncAt);
  const status = lagMs <= intervalMs * 1.5 ? "fresh" : lagMs <= intervalMs * 4 ? "late" : "broken";
  return { status: status as "fresh" | "late" | "broken", lagMs, label: label(lagMs) };
}
