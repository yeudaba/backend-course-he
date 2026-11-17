// P26-E118: SSE בשני שרתים — POST ב־A, אירוע ב־B
// כתוב וייצא async createLiveApp({ pub, sub, channel }) → { app, close }
//   GET /events — SSE, כל הודעה מהערוץ: "data: <json>" · POST /events — publish ו־202
//   מנוי אחד לאפליקציה · close() מבטל אותו
//
// בדיקה:  npm run check P26-E118
