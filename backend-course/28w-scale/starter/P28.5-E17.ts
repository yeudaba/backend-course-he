// P28.5-E17: כמה בתים שאילתה סורקת במחסן נתונים עמודתי — וכמה זה עולה
export interface TableStats {
  rows: number;
  columns: Record<string, number>;
  partitionedBy?: string;
  days?: number;
}

export interface QueryShape {
  columns: string[] | "*";
  days?: number;
  limit?: number;
}

export function estimateScan(t: TableStats, q: QueryShape, { pricePerTiB = 6.25 } = {}): { bytes: number; costUsd: number } {
  throw new Error("עוד לא כתבת את הפתרון");
}
