// P15-E49: רק JSON
// כתוב וייצא requireJson — middleware (req, res, next):
//   POST/PUT/PATCH בלי Content-Type של application/json → 415
//   { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "שלח JSON עם Content-Type: application/json" } }; אחרת next()
//
// הרצה:   node 15-express/starter/P15-E49.ts
// בדיקה:  npm run check P15-E49
