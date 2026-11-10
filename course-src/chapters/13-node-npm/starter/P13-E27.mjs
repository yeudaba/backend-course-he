// P13-E27: העלאת גרסה (semver) — חזרה על switch
// כתוב וייצא bump(version, kind):
//   bump("1.4.2", "patch") → "1.4.3" | "minor" → "1.5.0" | "major" → "2.0.0"
//   גרסה שאינה X.Y.Z (מספרים) → Error(`גרסה לא תקינה: ${version}`)
//   סוג אחר → Error(`סוג לא מוכר: ${kind}`)
// הבחירה בין הסוגים — עם switch.
//
// הרצה:   node 13-node-npm/starter/P13-E27.mjs
// בדיקה:  npm run check P13-E27
