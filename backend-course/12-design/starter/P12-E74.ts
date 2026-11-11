// P12-E74: עדכון חלקי (PATCH)
// כתוב וייצא (export):
//   class ValidationError extends Error — constructor(field, message); readonly field; name נכון
//   type ProductPatch = { name?: string; price?: number; tags?: string[] }
//   parseProductPatch(input: unknown): ProductPatch — רק השדות שנשלחו:
//     לא אובייקט → ("body", "גוף הבקשה חייב להיות אובייקט") · שדה לא מוכר → (<שם>, "שדה לא מוכר: <שם>")
//     אין שדות → ("body", "אין מה לעדכן")
//     name לא ריק (trim) · price חיובי עם עד 2 ספרות · tags מחרוזות לא ריקות בלי כפילויות (trim + קטנות)
//     לא תקין → (<שדה>, "<שדה> לא תקין"). בלי any.
//
// הרצה:   node 12-design/starter/P12-E74.ts
// בדיקה:  npm run check P12-E74
