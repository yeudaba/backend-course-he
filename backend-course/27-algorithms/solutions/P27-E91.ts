// P27-E91: cursor לעימוד — לקודד, לפענח, להמשיך
type Cursor = { createdAt: string; id: number };

export function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify({ createdAt: c.createdAt, id: c.id })).toString("base64url");
}

export function decodeCursor(s: string): Cursor | null {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) return null;
  try {
    const v = JSON.parse(Buffer.from(s, "base64url").toString("utf8"));
    if (typeof v?.createdAt !== "string" || !Number.isInteger(v?.id)) return null;
    return { createdAt: v.createdAt, id: v.id };
  } catch {
    return null;
  }
}

// האם a "אחרי" b בסדר יורד (createdAt, id)
const after = (a: Cursor, b: Cursor) => a.createdAt < b.createdAt || (a.createdAt === b.createdAt && a.id < b.id);

export function pageAfter<T extends Cursor>(sortedDesc: T[], cursor: string | null, limit: number) {
  let start = 0;
  const c = cursor === null ? null : decodeCursor(cursor);
  if (c) {
    let lo = 0;
    let hi = sortedDesc.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (after(sortedDesc[mid], c)) hi = mid;
      else lo = mid + 1;
    }
    start = lo;
  }
  const items = sortedDesc.slice(start, start + limit);
  const more = start + limit < sortedDesc.length;
  const last = items.at(-1);
  return { items, nextCursor: more && last ? encodeCursor(last) : null };
}
