// P26-E38: סקר — הצבעה אחת למשתמש
// כתוב וייצא:
//   vote(redis, pollId, userId, option) → true אם נספרה, false אם המשתמש כבר הצביע
//     (set: poll:<pollId>:voters · hash: poll:<pollId>:results)
//   results(redis, pollId) → [{ option, votes }] מהגבוה לנמוך, בשוויון לפי א״ב
//
// בדיקה:  npm run check P26-E38
