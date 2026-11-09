// P29.5-E11: תוצאות כלי שלא מציפות את ה־context — קיצור, ועימוד
export function limitToolOutput(text: string, { maxChars = 4000 } = {}): string {
  if (text.length <= maxChars) return text;
  const head = Math.floor(maxChars * 0.7);
  const tail = maxChars - head;
  const omitted = text.length - head - tail;
  return `${text.slice(0, head)}\n…[הושמטו ${omitted} תווים מתוך ${text.length}. בקש טווח מצומצם יותר (offset/limit) כדי לראות את השאר]…\n${text.slice(text.length - tail)}`;
}

export function paginate<T>(items: T[], { offset = 0, limit = 20, maxLimit = 50 } = {}) {
  if (!Number.isInteger(offset) || offset < 0) throw new Error("offset לא תקין");
  if (!Number.isInteger(limit) || limit < 1) throw new Error("limit לא תקין");
  const n = Math.min(limit, maxLimit);
  const page = items.slice(offset, offset + n);
  const next = offset + page.length;
  return { items: page, total: items.length, nextOffset: next < items.length ? next : null };
}
