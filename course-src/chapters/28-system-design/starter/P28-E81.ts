// P28-E81: שאילתה לכל ה־shards
// כתוב וייצא:
//   export function queryAllShards<T extends { at: number; id: number }>(shards: { name: string; query: (limit: number) => Promise<T[]> }[], limit: number): Promise<{ items: T[]; failed: string[] }>
//
// בדיקה:  npm run check P28-E81
