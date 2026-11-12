// P18-E67: "index" ממוין בזיכרון
// כתוב וייצא createIndex<T>(rows, key): { eq(v), range(from, to), comparisons() }
//   עותק ממוין (יציב); eq — key === v; range — from <= key < to; חיפוש בינארי (לכל היותר 40 השוואות ל־eq על 100,000)
//
// בדיקה:  npm run check P18-E67
