// P28.5-E106: עמודים מה־API, ועצירה מוקדמת
// כתוב וייצא:
//   export type Page<T> = { items: T[]; next: number | null };
//   export type FetchPage<T> = (page: number) => Promise<Page<T>>;
//   export function paginate<T>(fetchPage: FetchPage<T>): AsyncGenerator<T>
//   export function findFirst<T>(fetchPage: FetchPage<T>, pred: (item: T) => boolean): Promise<T | undefined>
//
// בדיקה:  npm run check P28.5-E106
