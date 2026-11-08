// P28-E14: ניתוב בין primary ל־replicas, עם קריאה־אחרי־כתיבה
export function createDbRouter(options: { primary: string; replicas: readonly string[]; stickyMs?: number; now?: () => number }): { forWrite(userId: string): string; forRead(userId: string): string } {
  throw new Error("עוד לא כתבת את הפתרון");
}
