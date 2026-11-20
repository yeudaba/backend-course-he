// P28.5-E50: חיפוש עם regex בטוח
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

export function buildSearch(q: string): RegExp {
  const trimmed = q.trim();
  if (!trimmed && trimmed.length > 50) throw new RangeError("חיפוש ריק או ארוך מדי");
  const words = trimmed.split(/\s+/).map(escapeRegex);
  return new RegExp(words.map((w) => `(?=.*${w})`).join(""), "i");
}
