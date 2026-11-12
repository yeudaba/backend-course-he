// P21-E35: toPublicUser
// כתוב וייצא type User, type PublicUser = Omit<User, "passwordHash">
//   toPublicUser(user) ← אובייקט חדש עם id, email, role, createdAt בלבד (שדות נוספים לא יוצאים)
//   toPublicUsers(users) ← אותו דבר לכל המערך. הקלט לא משתנה
//
// הרצה:   node 21-auth/starter/P21-E35.ts
// בדיקה:  npm run check P21-E35
