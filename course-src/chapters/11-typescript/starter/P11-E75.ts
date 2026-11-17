// P11-E75: משימה מ־JSON
// כתוב וייצא (export), בלי any ובלי as:
//   type Todo = { title: string; done: boolean; priority?: "low" | "high" }
//   parseTodo(json: string): Todo | null — JSON.parse ל־unknown ובדיקה של כל שדה;
//     title לא ריק, done בוליאני, priority (אם קיים) low/high. אחרת / JSON שבור → null.
//     מחזירים אובייקט חדש עם השדות האלה בלבד.
//
// הרצה:   node 11-typescript/starter/P11-E75.ts
// בדיקה:  npm run check P11-E75
