// P29.5-E27: בודק קלט של כלי לפי JSON Schema (חלק קטן) — חזרה על union, switch, typeof ורקורסיה
// כתוב וייצא:
//   type Schema = string (+enum) | number/integer (+minimum/maximum, כוללים) | boolean | array (+items) | object (+properties, required)
//   validate(schema, value, path = "input"): string[] — כל השגיאות, כל אחת "נתיב: הסבר"
//     נתיבים: input.items[1].qty · שדה חסר (required) · שדה שלא ב־properties ← שגיאה · NaN הוא לא מספר
//
// הרצה:   node 29w-agents/starter/P29.5-E27.ts
// בדיקה:  npm run check P29.5-E27
