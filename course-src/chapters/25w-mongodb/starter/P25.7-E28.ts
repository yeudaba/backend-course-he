// P25.7-E28: מה מסתתר ב־ObjectId — חזרה על parseInt/toString(16), padStart, regex ו־Date.UTC
// כתוב וייצא (בלי לייבא את mongodb — רק מחרוזות hex):
//   objectIdDate(id) → Date — 8 התווים הראשונים הם שניות מ־1970, ב־hex · לא 24 תווי hex ← TypeError
//   objectIdFromDate(date) → "6af2d608" + 16 אפסים — השניות (מעוגלות למטה) ב־8 תווי hex
//   idRangeForDay("2026-11-10") → { $gte, $lt } — מחצות UTC של היום עד חצות של מחר · לא YYYY-MM-DD ← TypeError
//
// הרצה:   node 25w-mongodb/starter/P25.7-E28.ts
// בדיקה:  npm run check P25.7-E28
