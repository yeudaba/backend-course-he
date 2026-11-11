// P15-E50: מצב תחזוקה
// כתוב וייצא maintenance(isOn: () => boolean, { allow = ["/health"] } = {}) — מחזירה middleware:
//   כבוי או req.path ב־allow → next(); אחרת 503 + Retry-After: 60 +
//   { error: { code: "MAINTENANCE", message: "השירות בתחזוקה, נסה שוב בעוד דקה" } }
//
// הרצה:   node 15-express/starter/P15-E50.ts
// בדיקה:  npm run check P15-E50
