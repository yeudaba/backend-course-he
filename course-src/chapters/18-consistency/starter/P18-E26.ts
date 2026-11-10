// P18-E26: withTransaction — עוזר שכותבים פעם אחת
// כתוב וייצא withTransaction<T>(pool, fn: (client) => Promise<T>): Promise<T>
//   BEGIN → fn(client) → COMMIT ומחזירה את התוצאה | שגיאה → ROLLBACK ואותה שגיאה הלאה | release תמיד
// ו־transferAll(pool, fromId, toId): Promise<number> — מעבירה את כל היתרה, כתובה עם withTransaction:
//   FOR UPDATE על המקור, איפוס, הוספה ליעד, רישום ב־transfers. מחזירה את הסכום.
//   חשבון לא קיים → Error(`חשבון לא קיים: ${id}`) | יתרה 0 → Error("אין מה להעביר")
//
// בדיקה:  npm run check P18-E26
