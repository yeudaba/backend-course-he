// P11-E28: שליפת משתמשים — נמצאו וחסרים
// כתוב וייצא (export):
//   type User = { id: number; name: string }
//   async function findUsers(ids: number[], getUser: (id: number) => Promise<User | undefined>)
//     : Promise<{ found: User[]; missing: number[] }>
// כל הבקשות במקביל. found ו־missing לפי הסדר שב־ids. id כפול — פעם אחת בלבד.
//
// הרצה:   node 11-typescript/starter/P11-E28.ts
// בדיקה:  npm run check P11-E28
