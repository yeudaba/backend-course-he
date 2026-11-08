// P30-E14: mergeCustomers — איחוד רשומות לקוח כפולות
export interface CustomerRecord {
  id: number;
  email?: string | null;
  phone?: string | null;
}

export function mergeCustomers(records: readonly CustomerRecord[]): number[][] {
  throw new Error("עוד לא כתבת את הפתרון");
}
