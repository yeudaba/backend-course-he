// P11-E26: טיפוסים מטיפוסים — Omit, Pick, Partial, Record
// כתוב וייצא (export):
//   type User        — id (number), name, email, passwordHash (string), role ("admin" | "member")
//   type PublicUser  — User בלי passwordHash (Omit)
//   type UserPatch   — רק name ו־email, שניהם אופציונליים (Partial + Pick)
//   type RoleCounts  — מספר לכל role (Record + User["role"])
//   toPublic(u: User): PublicUser                 — עותק בלי passwordHash
//   applyPatch(u: User, patch: UserPatch): User   — עותק מעודכן
//   countRoles(users: User[]): RoleCounts         — כמה מכל role (גם 0)
//
// הרצה:   node 11-typescript/starter/P11-E26.ts
// בדיקה:  npm run check P11-E26
