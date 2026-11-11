// P13-E54: הגדרות מדגלים וממשתני סביבה
// כתוב וייצא (export function ...):
//   resolveSettings(args, env) → { port, verbose, name }
//     port: --port 9000 / --port=9000 ← env.PORT ← 3000; שלם 1–65535, אחרת Error(`port לא תקין: ${text}`)
//     verbose: --verbose ← env.VERBOSE === "1" · name: הארגומנט הראשון שאינו דגל, או "app"
//     דגל אחר → Error(`דגל לא מוכר: ${flag}`)
//
// הרצה:   node 13-node-npm/starter/P13-E54.mjs
// בדיקה:  npm run check P13-E54
