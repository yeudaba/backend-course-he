// P13-E70: סכמה למשתני סביבה
// כתוב וייצא (export function ...):
//   parseEnv(env, schema) — schema: NAME → { type: "string" | "int" | "bool" | "enum", default?, values? }
//     חסר/ריק → default, או "<NAME>: חסר" · לא תקין → "<NAME>: לא תקין"
//     תוצאה ב־camelCase (DATABASE_URL → databaseUrl)
//     בעיות: Error("הגדרות לא תקינות:\n" + שורות) · type לא מוכר → Error(`סוג לא מוכר: ${type}`) מיד
//
// הרצה:   node 13-node-npm/starter/P13-E70.mjs
// בדיקה:  npm run check P13-E70
