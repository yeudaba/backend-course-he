// P27-E21
export interface Customer {
  id: number;
  name: string;
  email: string;
}

export function dedupeCustomers(list: readonly Customer[]): Customer[] {
  const seen = new Set<string>(); // תקלה 1: היה result.some(...) בתוך הלולאה ← O(n²): 50,000 לקוחות = מיליארד השוואות
  const result: Customer[] = [];
  // תקלה 3: היה list.sort(...) ← משנה את המערך של מי שקרא, ומחזיר בסדר אחר מהקלט
  for (const c of list) {
    const key = c.email.trim().toLowerCase(); // תקלה 2: השוואה של email גולמי ← "DANA@x" ו־"dana@x" נחשבו שונים
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(c);
  }
  return result;
}
