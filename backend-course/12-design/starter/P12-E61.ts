// P12-E61: repository למשתמשים
// כתוב וייצא (export):
//   type User = { id: number; email: string; name: string }
//   interface UserRepository — findById, findByEmail (Promise<User | null>), save (Promise<void>), delete (Promise<boolean>)
//   class InMemoryUserRepository implements UserRepository
//     findByEmail לא רגיש לאותיות ולרווחים בקצוות; תמיד שומרים ומחזירים עותקים
//
// הרצה:   node 12-design/starter/P12-E61.ts
// בדיקה:  npm run check P12-E61
