// P25.5-E101: השוואת שורות אחרי העברה — מתוקן
export interface Row {
  id: number;
  email: string;
  total: string;
}

export function diffRows(source: Row[], target: Row[]) {
  const dst = new Map(target.map((r) => [r.id, r]));
  const src = new Map(source.map((r) => [r.id, r]));
  const missing: number[] = [];
  const changed: number[] = [];
  for (const s of source) {
    const t = dst.get(s.id);
    if (!t) missing.push(s.id);
    else if (s.email !== t.email || Number(s.total) !== Number(t.total)) changed.push(s.id);
  }
  const extra = target.map((t) => t.id);
  const sort = (a: number[]) => a.sort((x, y) => x - y);
  return { missing: sort(missing), extra: sort(extra), changed: sort(changed) };
}
