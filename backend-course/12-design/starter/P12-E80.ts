// P12-E80: הרשמה מקצה לקצה
// כתוב וייצא (export):
//   class ValidationError extends Error — constructor(field, message); readonly field; name נכון
//   class ConflictError extends Error (name נכון)
//   parseSignup(input: unknown): { email; name; password } — email (trim + קטנות, /^[^@\s]+@[^@\s]+\.[^@\s]+$/), name לא ריק, password ≥ 8
//     שגיאה → ValidationError(<field>, "<field> לא תקין") (לא אובייקט: "body")
//   type User = { id; email; name; passwordHash } · interface UserRepository { findByEmail; insert(u: Omit<User, "id">): Promise<User> }
//   class SignupService — constructor(users, hash: (password: string) => string)
//     async signup(input: unknown): Promise<{ id; email; name }> — קיים → ConflictError("האימייל כבר רשום")
//
// הרצה:   node 12-design/starter/P12-E80.ts
// בדיקה:  npm run check P12-E80
