// P26-E65: לייק פעם אחת, עם Lua
// כתוב וייצא (set: likes:<postId> · מונה: likes:<postId>:count):
//   like(redis, postId, userId)    → המונה החדש, או -1 אם כבר עשה לייק (סקריפט Lua אחד)
//   unlike(redis, postId, userId)  → המונה החדש, או -1 אם לא עשה לייק
//   likeCount(redis, postId)       → מספר (0 אם אין)
//
// בדיקה:  npm run check P26-E65
