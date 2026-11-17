// P26.3-E52: rename ב־S3 — העתקה ומחיקה
// כתוב וייצא async moveObject(s3, bucket, from, to) → true · from לא קיים ← false
//   CopyObject (CopySource מקודד) ואז DeleteObject · from === to ← true בלי לגעת
//
// בדיקה:  npm run check P26.3-E52
