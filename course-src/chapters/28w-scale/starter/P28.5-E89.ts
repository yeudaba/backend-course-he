// P28.5-E89: השוואת watermarks
// כתוב וייצא:
//   export type Watermark = { updatedAt: string; id: number };
//   export function compareWm(a: Watermark, b: Watermark): number
//   export function changesAfter<T extends Watermark>(rows: T[], wm: Watermark | null, limit: number): { page: T[]; next: Watermark | null }
//
// בדיקה:  npm run check P28.5-E89
