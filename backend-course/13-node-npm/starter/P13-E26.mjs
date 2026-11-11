// P13-E26: פירוק שורת לוג עם regex
// כתוב וייצא parseAccessLine(line) לשורה בפורמט:
//   203.0.113.7 - - [10/Nov/2026:13:05:01 +0000] "GET /api/users?page=2 HTTP/1.1" 200 512
// → { ip, time, method, path, status, bytes }   (status ו־bytes מספרים; bytes "-" → 0)
// רווחים בקצוות לא מפריעים. שורה שלא בפורמט → null. משתמשים ב־regex (קבוצות בשם: (?<ip>...)).
//
// הרצה:   node 13-node-npm/starter/P13-E26.mjs
// בדיקה:  npm run check P13-E26
