// P15-E36: קישורים מקוצרים
// כתוב וייצא createApp():
//   POST /links { url } → 201 { code, url } + Location (code: "1", "2"...); אותה כתובת שוב → 200 עם אותו code;
//   url לא http(s) תקין → 400 { error: "כתובת לא תקינה" }
//   GET /links/:code → 302 + Location, בלי גוף; לא קיים → 404 { error: "קישור לא קיים" }
//
// הרצה:   node 15-express/starter/P15-E36.ts
// בדיקה:  npm run check P15-E36
