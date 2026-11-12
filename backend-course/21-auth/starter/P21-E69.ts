// P21-E69: fetch שמרענן לבד על 401
// כתוב וייצא type Tokens, type TokenStore = { get(), set(tokens | null) }, createAuthedFetch(baseUrl, store) ← (path, init?) => Promise<Response>
//   Authorization: Bearer <access> | 401 ← POST /auth/refresh { refreshToken } (אחד לכל הבקשות יחד)
//   200 ← store.set(חדש) ושולחים שוב פעם אחת | אחרת ← store.set(null) ומחזירים את ה־401
//
// הרצה:   node 21-auth/starter/P21-E69.ts
// בדיקה:  npm run check P21-E69
