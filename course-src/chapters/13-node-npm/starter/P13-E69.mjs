// P13-E69: הפניות בין משתנים ב־.env
// כתוב וייצא (export function ...):
//   expand(vars) → אובייקט חדש שבו ${NAME} מוחלף בערך (גם הפניה בתוך הפניה)
//     לא מוגדר → Error(`משתנה לא מוגדר: ${NAME} (ב־${KEY})`) · מעגל → Error(`הפניה מעגלית: ${KEY}`)
//
// הרצה:   node 13-node-npm/starter/P13-E69.mjs
// בדיקה:  npm run check P13-E69
