// P21-E64: refresh token ב־cookie
// כתוב וייצא refreshCookie(token, maxAgeSec), clearRefreshCookie(), readRefreshCookie(cookieHeader)
//   refresh_token=<token>; Max-Age=<n>; Path=/auth; HttpOnly; Secure; SameSite=Strict | מחיקה: ערך ריק ו־Max-Age=0
//   readRefreshCookie("a=1; refresh_token=xyz") ← "xyz" | אין / ריק ← null
//
// הרצה:   node 21-auth/starter/P21-E64.ts
// בדיקה:  npm run check P21-E64
