// P28.5-E106: עמודים מה־API — מוטנט: טוען את כל העמודים למערך, ורק אז מחזיר פריטים
export type Page<T> = { items: T[]; next: number | null };
export type FetchPage<T> = (page: number) => Promise<Page<T>>;

export async function* paginate<T>(fetchPage: FetchPage<T>): AsyncGenerator<T> {
  const all: T[] = [];
  let page: number | null = 1;
  while (page !== null) {
    const res: Page<T> = await fetchPage(page);
    all.push(...res.items);
    page = res.next;
  }
  yield* all;
}

export async function findFirst<T>(fetchPage: FetchPage<T>, pred: (item: T) => boolean): Promise<T | undefined> {
  for await (const item of paginate(fetchPage)) {
    if (pred(item)) return item;
  }
  return undefined;
}
