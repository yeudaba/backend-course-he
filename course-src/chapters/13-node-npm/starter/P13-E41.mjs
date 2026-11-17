// P13-E41: פרטי פרויקט מ־package.json
// כתוב וייצא (export function ...):
//   async projectInfo(dir) → { name, version (חסר → "0.0.0"), scripts: [...שמות], deps, devDeps }
//     אין קובץ → Error(`אין package.json ב־${dir}`) · JSON לא תקין → Error("package.json לא תקין")
//     שגיאה אחרת — עוברת כמו שהיא
//
// הרצה:   node 13-node-npm/starter/P13-E41.mjs
// בדיקה:  npm run check P13-E41
