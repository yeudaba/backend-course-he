// P28.5-E98: השינויים מ־PostgreSQL, לפי עמודים
// כתוב וייצא:
//   export function fetchChanges(pool: { query: Function }, wm: { updatedAt: string; id: number } | null, limit: number): Promise<{ id: number; status: string; totalCents: number; updatedAt: string }[]>
//
// בדיקה:  npm run check P28.5-E98
