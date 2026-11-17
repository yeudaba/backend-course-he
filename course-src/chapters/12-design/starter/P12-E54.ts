// P12-E54: בטל ובצע שוב
// כתוב וייצא (export):
//   class NothingToUndoError / NothingToRedoError extends Error — "אין מה לבטל" / "אין מה לבצע שוב"
//   class History:
//     push(action) — מוחקת את מה שאפשר היה לבצע שוב
//     undo(): string · redo(): string · get done: string[] (עותק, מהישנה לחדשה)
//
// הרצה:   node 12-design/starter/P12-E54.ts
// בדיקה:  npm run check P12-E54
