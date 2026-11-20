// P27-E104: עימוד עם cursor — + ו־/ בכתובת, 500 על cursor משובש, והזמנות באותה שנייה נעלמות.
// encodeCursor ← base64url · decodeCursor ← אובייקט או null, בלי לזרוק · pageAfter(items, cursor, limit) ← { items, nextCursor }
//
// בדיקה:  npm run check P27-E104
export type Cursor = { createdAt: string; id: number };

export function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify({ createdAt: c.createdAt, id: c.id })).toString("base64");
}

export function decodeCursor(s: string): Cursor | null {
  const v = JSON.parse(Buffer.from(s, "base64").toString("utf8"));
  return typeof v?.createdAt === "string" && Number.isInteger(v?.id) ? { createdAt: v.createdAt, id: v.id } : null;
}

export function pageAfter<T extends Cursor>(items: T[], cursor: Cursor | null, limit: number) {
  const after = cursor ? items.filter((i) => i.createdAt < cursor.createdAt) : items;
  const page = after.slice(0, limit);
  const last = page.at(-1);
  return { items: page, nextCursor: after.length > limit && last ? encodeCursor(last) : null };
}
