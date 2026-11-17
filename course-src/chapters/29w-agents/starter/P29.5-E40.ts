// P29.5-E40: היסטוריה במסד, רק להוסיף
// כתוב וייצא:
//   type Db = { query(text: string, params?: unknown[]): Promise<{ rows: any[] }> };
//   type Msg = { role: string; content: unknown };
//   export function appendMessages(db: Db, conversationId: string, expectedCount: number, messages: Msg[]): Promise<number>
//   export function loadMessages(db: Db, conversationId: string): Promise<Msg[]>
//
// בדיקה:  npm run check P29.5-E40
