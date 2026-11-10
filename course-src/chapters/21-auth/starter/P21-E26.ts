// P21-E26: JWT ביד, עם node:crypto
// כתוב וייצא type Claims = { sub: number; role: string; iat: number; exp: number }
//   signJwt(payload, secret, expiresInSec, now = שניות מעכשיו) — header {"alg":"HS256","typ":"JWT"},
//      payload { sub, role, iat, exp }, חתימה HMAC-SHA256 ב־base64url (זהה ל־jsonwebtoken)
//   verifyJwt(token, secret, now = שניות מעכשיו): Claims — לפי הסדר:
//      לא 3 חלקים → Error("טוקן לא תקין") | חתימה לא תואמת (timingSafeEqual) → Error("חתימה לא תקינה")
//      alg שאינו HS256 / JSON שבור → Error("טוקן לא תקין") | now >= exp → Error("פג תוקף")
//
// הרצה:   node 21-auth/starter/P21-E26.ts
// בדיקה:  npm run check P21-E26
