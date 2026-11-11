// P15.5-E13: טבלת HTML מנתונים
// כתוב וייצא renderTable(columns, rows) → מחרוזת HTML בשורה אחת:
//   <table><thead><tr><th>label</th>...</tr></thead><tbody><tr><td>...</td>...</tr>...</tbody></table>
//   columns: [{ key, label, numeric? }] — תא לכל עמודה לפי הסדר. numeric → <td class="num">
//   null/undefined → —   (0 נשאר 0). כל טקסט מקודד (& < > " ') — גם הכותרות.
//   אין שורות → <p class="empty">אין נתונים להצגה</p>
//
// הרצה:   node 15w-web-bridge/starter/P15.5-E13.mjs
// בדיקה:  npm run check P15.5-E13
