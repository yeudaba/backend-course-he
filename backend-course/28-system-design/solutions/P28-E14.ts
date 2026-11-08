// P28-E14
// primary + replicas: כתיבות ל־primary, קריאות ל־replicas — חוץ מ"קריאה אחרי כתיבה":
// משתמש שכתב עכשיו קורא מה־primary לזמן קצר, כי ה־replica עוד לא קיבלה את השינוי (replication lag)
export function createDbRouter({ primary, replicas, stickyMs = 2000, now = () => Date.now() }: { primary: string; replicas: readonly string[]; stickyMs?: number; now?: () => number }) {
  const lastWrite = new Map<string, number>();
  let next = 0;
  return {
    forWrite(userId: string): string {
      lastWrite.set(userId, now());
      return primary;
    },
    forRead(userId: string): string {
      const at = lastWrite.get(userId);
      if (at !== undefined && now() - at < stickyMs) return primary;
      if (replicas.length === 0) return primary;
      return replicas[next++ % replicas.length];
    },
  };
}
