// P28.5-E17: כמה בתים שאילתה סורקת במחסן נתונים עמודתי — וכמה זה עולה
export interface TableStats {
  rows: number;
  columns: Record<string, number>; // ממוצע בתים לערך, לכל עמודה
  partitionedBy?: string; // עמודת תאריך
  days?: number; // כמה ימים יש בטבלה (פרטישן לכל יום)
}

export interface QueryShape {
  columns: string[] | "*";
  days?: number; // WHERE על עמודת ה־partition: כמה ימים נבחרו
  limit?: number; // לא משנה את הסריקה!
}

const TiB = 2 ** 40;

export function estimateScan(t: TableStats, q: QueryShape, { pricePerTiB = 6.25 } = {}) {
  const cols = q.columns === "*" ? Object.keys(t.columns) : q.columns;
  for (const c of cols) if (!(c in t.columns)) throw new Error(`עמודה לא קיימת: ${c}`);
  const bytesPerRow = cols.reduce((s, c) => s + t.columns[c], 0); // עמודתי: רק העמודות שנבחרו
  const fraction = t.partitionedBy && t.days && q.days !== undefined ? Math.min(1, q.days / t.days) : 1; // partition pruning
  const bytes = Math.round(t.rows * fraction * bytesPerRow);
  return { bytes, costUsd: Math.round((bytes / TiB) * pricePerTiB * 100) / 100 };
}
