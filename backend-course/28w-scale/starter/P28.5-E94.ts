// P28.5-E94: לולאת הסנכרון
// כתוב וייצא:
//   export function runSync<T extends { updatedAt: string; id: number }>(deps: { loadWm(): Promise<Wm | null>; fetchAfter(wm: Wm | null, limit: number): Promise<T[]>; writeBatch(rows: T[], n: number): Promise<void>; saveWm(wm: Wm): Promise<void> }, limit?: number): Promise<{ pages: number; rows: number; wm: Wm | null }>
//
// בדיקה:  npm run check P28.5-E94
