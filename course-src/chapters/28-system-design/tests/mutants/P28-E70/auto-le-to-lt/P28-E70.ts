// P28-E70: UPDATE אחד לכל האצווה
export function clicksUpdate(entries: [string, number][]) {
  const merged = new Map<string, number>();
  for (const [code, n] of entries) {
    if (!Number.isInteger(n) || n < 0) throw new RangeError(`מספר קליקים לא תקין ל־${code}: ${n}`);
    merged.set(code, (merged.get(code) ?? 0) + n);
  }
  if (merged.size === 0) return null;
  const values: (string | number)[] = [];
  const rows = [...merged].map(([code, n], i) => {
    values.push(code, n);
    return `($${2 * i + 1}, $${2 * i + 2}::bigint)`;
  });
  return {
    text: `UPDATE links SET clicks = links.clicks + v.n FROM (VALUES ${rows.join(", ")}) AS v(code, n) WHERE links.code = v.code`,
    values,
  };
}
