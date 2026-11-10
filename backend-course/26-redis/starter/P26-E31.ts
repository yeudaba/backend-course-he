// P26-E31: sessions ב־Redis — מקובץ ריק
// כתוב וייצא (redis הוא Redis של ioredis; המפתחות: session:<id> — hash, user:<userId>:sessions — set):
//   createSession(redis, userId, data = {}, ttlSec = 1800) → id (randomUUID) · ב־MULTI: HSET (data + userId), EXPIRE, SADD, ותוקף לרשימה
//   getSession(redis, id, ttlSec = 1800) → { userId: number, data } או null · כל קריאה מאריכה את התוקף (sliding)
//   destroySession(redis, id) → true/false · מוחק את ה־hash ומוציא מהרשימה
//   destroyAllForUser(redis, userId) → כמה sessions נמחקו · מוחק גם את הרשימה
//
// הרצה:   אין פלט — נסה מ־demo.mts (ראה הפתרון), או ישר npm run check
// בדיקה:  npm run check P26-E31
