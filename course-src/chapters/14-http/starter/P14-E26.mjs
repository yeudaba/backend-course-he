// P14-E26: פירוק header של Cookie
// כתוב וייצא parseCookies(header):
//   parseCookies("theme=dark; lang=he; cart=%D7%A1%D7%9C") → { theme: "dark", lang: "he", cart: "סל" }
//   רווחים מסביב לשם ולערך — מסירים. ערכים — decodeURIComponent. רק ה־= הראשון מפריד (token=a=b=c).
//   חלק בלי = או עם שם ריק — מדלגים. undefined או "" → {}
//
// הרצה:   node 14-http/starter/P14-E26.mjs
// בדיקה:  npm run check P14-E26
