// P13-E35: להוסיף תלות
// כתוב וייצא (export function ...):
//   addDependency(pkg, name, version, { dev = false } = {}) → package.json חדש:
//     name: "^" + version ב־dependencies (או devDependencies); חלק חסר — נוצר
//     אם החבילה בחלק השני — מועברת (וחלק שהתרוקן נמחק); מפתחות החלק ממוינים. אסור לשנות את pkg.
//
// הרצה:   node 13-node-npm/starter/P13-E35.mjs
// בדיקה:  npm run check P13-E35
