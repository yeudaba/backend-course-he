// P13-E77: שם קובץ פנוי
// כתוב וייצא (export async function ...):
//   freeName(dir, name) — רק path.basename(name); אם תפוס: "base (1).ext", "base (2).ext"...
//   (ext לפי path.extname; בלי סיומת: "README (1)")
//   fs.stat: ENOENT = פנוי; כל שגיאה אחרת — נזרקת
//
// הרצה:   node 13-node-npm/starter/P13-E77.mjs
// בדיקה:  npm run check P13-E77
