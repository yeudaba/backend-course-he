// P20-E50: הרשמה — DTO, 409 ובלי סיסמה בתשובה
// כתוב וייצא SignupDto (email; password ≥ 8 עם ספרה — "password חייב לכלול ספרה"; displayName? 2–40),
//   UsersService, SignupController, SignupModule
//   POST /signup ← 201 { id, email (קטנות), displayName (או null) } | אימייל רשום ← 409 "האימייל כבר רשום"
//
// בדיקה:  npm run check P20-E50
