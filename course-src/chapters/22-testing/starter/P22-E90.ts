// P22-E90: signUp ו־auth
// כתוב וייצא type Tokens, signUp(baseUrl, email, password = "password-123") ← { accessToken, refreshToken }, auth(token)
//   POST /auth/register (חייב 201) ואז POST /auth/login (חייב 200); אחרת Error(`signUp(${email}): ${status} ${גוף}`)
//   auth(token) ← { authorization: `Bearer ${token}` }
//
// הרצה:   node 22-testing/starter/P22-E90.ts
// בדיקה:  npm run check P22-E90
