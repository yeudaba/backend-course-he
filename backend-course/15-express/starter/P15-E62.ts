// P15-E62: מיון לפי כמה שדות
// כתוב וייצא sortBy<T>(items: T[], sort: string, allowed: string[]): T[]
//   "status,-createdAt" — עולה/יורד לפי סדר השדות; מספרים כמספרים, השאר localeCompare
//   שדה לא ב־allowed → throw Error(`אי אפשר למיין לפי ${field}`); מערך חדש, מיון יציב
//
// הרצה:   node 15-express/starter/P15-E62.ts
// בדיקה:  npm run check P15-E62
