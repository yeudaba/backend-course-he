// P28.5-E106: עמודים מה־API, ועצירה מוקדמת
export type Page<T> = { items: T[]; next: number | null };
export type FetchPage<T> = (page: number) => Promise<Page<T>>;

export async function* paginate<T>(fetchPage: FetchPage<T>): AsyncGenerator<T> {
  let page: number | null = 1;
  while (page !== null) {
    const res: Page<T> = await fetchPage(page);
    for (const item of res.items) yield item;
    page = res.next;
  }
}

export async function findFirst<T>(fetchPage: FetchPage<T>, pred: (item: T) => boolean): Promise<T | undefined> {
  for await (const item of paginate(fetchPage)) {
    if (pred(item)) return item;
  }
  return undefined;
}
