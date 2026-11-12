// P21-E63: AccessTokens עם tokenVersion
// כתוב וייצא class AccessTokens: constructor(secret, now: () => שניות), issue(userId), verify(token) ← { id }, logoutEverywhere(userId)
//   JwtService של @nestjs/jwt | payload { sub, ver, iat: now() }, expiresIn 900 | verify עם clockTimestamp, ו־ver == הגרסה הנוכחית
//   כל כשל ← Error("טוקן לא תקין") | logoutEverywhere ← גרסה + 1
//
// הרצה:   node 21-auth/starter/P21-E63.ts
// בדיקה:  npm run check P21-E63
