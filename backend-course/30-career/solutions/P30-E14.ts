// P30-E14
// שאלת קוד מראיון: איחוד רשומות לקוח כפולות. אותו אימייל *או* אותו טלפון ← אותו אדם — גם בשרשרת
// (A ו־B חולקים אימייל, B ו־C חולקים טלפון ← A, B, C ביחד). Union-Find: כמעט O(n)
export interface CustomerRecord {
  id: number;
  email?: string | null;
  phone?: string | null;
}

export const normEmail = (e?: string | null) => (e ?? "").trim().toLowerCase() || null;
export function normPhone(p?: string | null): string | null {
  let d = (p ?? "").replace(/\D/g, "");
  if (d.startsWith("972")) d = "0" + d.slice(3);
  return d.length >= 9 ? d : null;
}

export function mergeCustomers(records: readonly CustomerRecord[]): number[][] {
  const parent = new Map<number, number>();
  const find = (x: number): number => {
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r)!;
    while (parent.get(x) !== r) {
      const next = parent.get(x)!;
      parent.set(x, r); // דחיסת מסלול
      x = next;
    }
    return r;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(Math.max(ra, rb), Math.min(ra, rb));
  };
  for (const r of records) parent.set(r.id, r.id);
  const owner = new Map<string, number>(); // "e:..."/"p:..." ← הרשומה הראשונה עם הערך
  for (const r of records) {
    for (const key of [normEmail(r.email) && `e:${normEmail(r.email)}`, normPhone(r.phone) && `p:${normPhone(r.phone)}`]) {
      if (!key) continue;
      const first = owner.get(key);
      if (first === undefined) owner.set(key, r.id);
      else union(first, r.id);
    }
  }
  const groups = new Map<number, number[]>();
  for (const r of records) {
    const root = find(r.id);
    (groups.get(root) ?? groups.set(root, []).get(root)!).push(r.id);
  }
  return [...groups.values()].map((g) => g.sort((a, b) => a - b)).sort((a, b) => a[0] - b[0]);
}
