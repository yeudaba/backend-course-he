// P25.5-E101: השוואת שורות אחרי העברה — על טבלאות זהות היא מדווחת שהכול השתנה, ו־extra תמיד ריק.
// diffRows(source, target) ← { missing, extra, changed } — ids ממוינים · השוואה לפי id · total כמספר
//
// בדיקה:  npm run check P25.5-E101
export interface Row {
  id: number;
  email: string;
  total: string;
}

export function diffRows(source: Row[], target: Row[]) {
  const ids = new Set(target.map((r) => r.id));
  const missing: number[] = [];
  const changed: number[] = [];
  source.forEach((s, i) => {
    if (!ids.has(s.id)) missing.push(s.id);
    else if (s.email !== target[i]?.email || s.total !== target[i]?.total) changed.push(s.id);
  });
  const extra: number[] = [];
  const sort = (a: number[]) => a.sort((x, y) => x - y);
  return { missing: sort(missing), extra: sort(extra), changed: sort(changed) };
}
