// P15-E77: שגיאות לפי שדה
// כתוב וייצא toFieldErrors(error: z.ZodError) → { "path.join('.')" | "_root": [הודעות] },
//   signupSchema (email, password ≥8 עם ספרה, tags מחרוזות לא ריקות, ברירת מחדל [])
//   ו־createApp(): POST /signup → 201 { email, tags } או 400 { error: { code: "VALIDATION_ERROR", fields } }
//
// הרצה:   node 15-express/starter/P15-E77.ts
// בדיקה:  npm run check P15-E77
