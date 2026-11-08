// P28-E11
// cursor "אטום": הלקוח לא יודע (ולא צריך לדעת) מה בפנים. base64url של JSON — ובדיקה כשהוא חוזר
export interface Cursor {
  createdAt: string; // ISO
  id: number;
}

export function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify([c.createdAt, c.id])).toString("base64url");
}

export function decodeCursor(raw: string): Cursor {
  try {
    const [createdAt, id] = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt)) || !Number.isSafeInteger(id) || id < 1) throw new Error();
    return { createdAt, id };
  } catch {
    throw new Error("cursor לא תקין");
  }
}

// keyset: "אחרי השורה הזו" במיון (createdAt DESC, id DESC). בלי OFFSET — מהיר בכל עמוד, ולא מדלג/מכפיל כשנוספות שורות
export function nextPage<T extends Cursor>(rows: readonly T[], limit: number, after?: string) {
  const sorted = [...rows].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : b.id - a.id));
  const c = after ? decodeCursor(after) : null;
  const start = c ? sorted.findIndex((r) => r.createdAt < c.createdAt || (r.createdAt === c.createdAt && r.id < c.id)) : 0;
  const page = start === -1 ? [] : sorted.slice(start, start + limit);
  const last = page[page.length - 1];
  const hasMore = start !== -1 && start + limit < sorted.length;
  return { data: page, nextCursor: hasMore && last ? encodeCursor(last) : null };
}
