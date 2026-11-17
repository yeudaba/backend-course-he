// P26.5-E53: fanout — הודעה לכל ה־instances
// כתוב וייצא:
//   async subscribeInstance(ch, exchange, onMessage) → { queue, cancel() } · fanout, תור exclusive בשם שהשרת בוחר, noAck
//   broadcast(ch, exchange, data) → מה ש־publish החזיר
//
// בדיקה:  npm run check P26.5-E53
