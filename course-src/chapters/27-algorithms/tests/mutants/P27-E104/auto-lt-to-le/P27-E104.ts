// P27-E104: עימוד עם cursor — מתוקן
export type Cursor = { createdAt: string; id: number };

export function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify({ createdAt: c.createdAt, id: c.id })).toString("base64url");
}

export function decodeCursor(s: string): Cursor | null {
  try {
    const v = JSON.parse(Buffer.from(s, "base64url").toString("utf8"));
    return typeof v?.createdAt === "string" && Number.isInteger(v?.id) ? { createdAt: v.createdAt, id: v.id } : null;
  } catch {
    return null;
  }
}

export function pageAfter<T extends Cursor>(items: T[], cursor: Cursor | null, limit: number) {
  const after = cursor ? items.filter((i) => i.createdAt < cursor.createdAt || (i.createdAt === cursor.createdAt && i.id <= cursor.id)) : items;
  const page = after.slice(0, limit);
  const last = page.at(-1);
  return { items: page, nextCursor: after.length > limit && last ? encodeCursor(last) : null };
}
