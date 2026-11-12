// P19-E64: Zod לפי המודל, ואז create
// כתוב וייצא CustomerInput (Zod) ו־async function createCustomer(prisma, body: unknown)
//   fullName (trim, לא ריק), email (z.email, אותיות קטנות), city (לא ריק או null, ברירת מחדל null), joinedOn (z.iso.date)
//   מחזירה { id, fullName, email, city, joinedOn: "YYYY-MM-DD" }
//
// בדיקה:  npm run check P19-E64
