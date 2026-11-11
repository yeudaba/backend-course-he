// P12-E35: רשימת משימות
// כתוב וייצא (export):
//   type Todo = { id: number; title: string; done: boolean }
//   class TodoList:
//     add(title): number — trim, ריק → Error("כותרת ריקה"); מזהים 1, 2, 3... שלא חוזרים
//     complete(id) — לא קיים → Error("משימה <id> לא קיימת")
//     remove(id): boolean · get pending: string[] · all(): Todo[] (עותקים)
//
// הרצה:   node 12-design/starter/P12-E35.ts
// בדיקה:  npm run check P12-E35
