// P12-E73: מזהה מהבקשה
// כתוב וייצא (export):
//   class ValidationError extends Error — constructor(field, message); readonly field; name נכון
//   parseId(input: unknown, field = "id"): number — מספר שלם חיובי, או מחרוזת של ספרות בלבד (רווחים בקצוות מותרים)
//     אחרת → ValidationError(field, `${field} חייב להיות מספר שלם חיובי`). בלי any.
//
// הרצה:   node 12-design/starter/P12-E73.ts
// בדיקה:  npm run check P12-E73
