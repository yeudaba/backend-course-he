// P21-E44: registerSchema עם Zod
// כתוב וייצא registerSchema (z.strictObject): email (trim, אותיות קטנות, אימייל), password (8 תווים, עד 72 בתים)
//   ו־parseRegister(body) ← { ok: true, data } | { ok: false, errors: ["password: לפחות 8 תווים", ...] }
//
// הרצה:   node 21-auth/starter/P21-E44.ts
// בדיקה:  npm run check P21-E44
