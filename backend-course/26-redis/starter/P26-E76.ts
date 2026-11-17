// P26-E76: לוח זמנים של backoff
// כתוב וייצא:
//   backoffDelays(attempts, delay, "fixed" | "exponential") → ההמתנות (ms) לפני כל ניסיון חוזר (attempts − 1 מספרים)
//   giveUpAfter(attempts, delay, type) → סכום ההמתנות
//   attempts לא שלם חיובי, או delay שלילי ← RangeError
//
// בדיקה:  npm run check P26-E76
