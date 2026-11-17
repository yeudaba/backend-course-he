// P26-E120: Last-Event-ID בין שרתים — מאגר ב־Redis
// כתוב וייצא:
//   appendEvent(redis, stream, event, data, max = 100) → id (INCR sse:<stream>:seq) · RPUSH ל־sse:<stream>:log + LTRIM
//   eventsAfter(redis, stream, lastId) → [{ id, event, data }] עם id > lastId, ממוינים
//
// בדיקה:  npm run check P26-E120
