// P28.5-E107: דוח הזמנות ששולמו — מוטנט: generator חדש לכל לולאה — התוצאה נכונה, אבל כל עמוד נטען פעמיים
export type Order = { id: string; paid: boolean };
export type Page = { items: Order[]; next: number | null };
type FetchPage = (page: number) => Promise<Page>;

export async function* paidOrders(fetchPage: FetchPage): AsyncGenerator<Order> {
  let page: number | null = 1;
  while (page !== null) {
    const res: Page = await fetchPage(page);
    for (const o of res.items) {
      if (o.paid) yield o;
    }
    page = res.next;
  }
}

export async function paidReport(fetchPage: FetchPage): Promise<{ count: number; ids: string[] }> {
  let count = 0;
  for await (const o of paidOrders(fetchPage)) count++;
  const ids: string[] = [];
  for await (const o of paidOrders(fetchPage)) ids.push(o.id);
  return { count, ids };
}
