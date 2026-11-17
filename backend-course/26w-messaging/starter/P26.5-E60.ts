// P26.5-E60: השהיה לכל הודעה — בלי head-of-line
// כתוב וייצא async scheduleIn(ch, { waitPrefix, target }, payload, delayMs) → שם תור ההמתנה
//   <waitPrefix>.<delayMs> · messageTtl · dead letter ל־"" עם routing key = target · expires
//
// בדיקה:  npm run check P26.5-E60
