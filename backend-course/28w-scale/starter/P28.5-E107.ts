// P28.5-E107: דוח הזמנות ששולמו — לא עובר קומפילציה, ואחרי התיקון מחזיר ids ריק.
// paidOrders(fetchPage) ← רק הזמנות עם paid: true, מכל העמודים
// paidReport(fetchPage) ← { count, ids }, וכל עמוד נטען פעם אחת
//
// בדיקה:  npm run check P28.5-E107
export type Order = { id: string; paid: boolean };
export type Page = { items: Order[]; next: number | null };
type FetchPage = (page: number) => Promise<Page>;

export async function* paidOrders(fetchPage: FetchPage): AsyncGenerator<Order> {
  let page: number | null = 1;
  while (page !== null) {
    const res: Page = await fetchPage(page);
    res.items.forEach((o) => {
      if (o.paid) yield o;
    });
    page = res.next;
  }
}

export async function paidReport(fetchPage: FetchPage): Promise<{ count: number; ids: string[] }> {
  const orders = paidOrders(fetchPage);
  let count = 0;
  for (const o of orders) count++;
  const ids: string[] = [];
  for await (const o of orders) ids.push(o.id);
  return { count, ids };
}
