// P15-E33: PUT שיוצר או מחליף
// כתוב וייצא createApp() — הגדרות בזיכרון:
//   PUT /settings/:key { value } → 201 + Location (חדש) או 200 (הוחלף), גוף { key, value }; בלי value → 400 { error: "חסר value" }
//   GET /settings/:key → { key, value } או 404 { error: "אין הגדרה כזו" }; GET /settings → אובייקט של כולן
//
// הרצה:   node 15-express/starter/P15-E33.ts
// בדיקה:  npm run check P15-E33
