// P26.5-E37: הודעה פגומה לא חוסמת את התור
// כתוב וייצא async processAll(messages, handler, maxAttempts) → { done, dead: [{ id, attempts, error }] }
//   כישלון ← לסוף התור · אחרי maxAttempts ← dead
//
// בדיקה:  npm run check P26.5-E37
