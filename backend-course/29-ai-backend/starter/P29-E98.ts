// P29-E98: שליפת מסמכים מ־PostgreSQL, לפי הרשאה
// כתוב וייצא:
//   type Db = { query(text: string, params: unknown[]): Promise<{ rows: any[] }> };
//   export function searchDocs(db: Db, question: string, opts: { role: "customer" | "staff"; k?: number }): Promise<{ id: number; title: string; score: number }[]>
//
// בדיקה:  npm run check P29-E98
