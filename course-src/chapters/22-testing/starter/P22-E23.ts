// P22-E23 — הקוד שבודקים (לא משנים אותו)
export interface Sale {
  category: string;
  amount: number; // החזר (refund) — סכום שלילי
}

export interface SalesRepository {
  findByMonth(year: number, month: number): Promise<Sale[]>; // month: 1–12
}

export async function monthlyReport(repo: SalesRepository, year: number, month: number) {
  const sales = await repo.findByMonth(year, month);
  const byCategory: Record<string, number> = {};
  for (const s of sales) byCategory[s.category] = (byCategory[s.category] ?? 0) + s.amount;
  const total = sales.reduce((sum, s) => sum + s.amount, 0);
  return { count: sales.length, total, byCategory };
}
