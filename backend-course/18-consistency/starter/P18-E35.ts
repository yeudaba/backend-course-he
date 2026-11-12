// P18-E35: פתיחת חשבון עם הפקדה ראשונה
// כתוב וייצא async function openAccount(pool, owner, fromId, deposit): Promise<number>
//   transaction אחד: INSERT חשבון (יתרה 0, RETURNING id) ← הורדה מ־fromId ← הוספה לחדש ← רישום ב־transfers
//   שגיאה ← ROLLBACK (לא נשאר חשבון) ו־throw; release תמיד
//
// בדיקה:  npm run check P18-E35
