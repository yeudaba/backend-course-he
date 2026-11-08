// P27-E21: "לקוחות כפולים נשארים, הרשימה יוצאת בסדר אחר, ועם 50,000 לקוחות זה נתקע" — שלוש תקלות
export interface Customer {
  id: number;
  name: string;
  email: string;
}

export function dedupeCustomers(list: Customer[]): Customer[] {
  const result: Customer[] = [];
  for (const c of list.sort((a, b) => a.id - b.id)) {
    if (result.some((r) => r.email === c.email)) continue;
    result.push(c);
  }
  return result;
}
