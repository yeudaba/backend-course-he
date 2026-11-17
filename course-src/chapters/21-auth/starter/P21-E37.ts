// P21-E37: PasswordService
// כתוב וייצא class PasswordService: constructor(rounds), hash(password), verify(password, hash)
//   verifyAgainstDummy(password): Promise<false> — bcrypt.compare אמיתי מול hash דמה עם אותו cost,
//   שמחושב פעם אחת למופע. תמיד false. (import bcrypt from "bcryptjs" ו־bcrypt.compare)
//
// הרצה:   node 21-auth/starter/P21-E37.ts
// בדיקה:  npm run check P21-E37
