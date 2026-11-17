// P10-E44: מנבא ה־event loop
// predictOrder(steps): steps = { kind: "sync" | "promise" | "timeout", label, ms? } לפי הסדר בקוד.
// מחזירה labels לפי סדר ההדפסה: sync ← promise ← timeout (לפי ms, בשוויון לפי הסדר).
// סוג לא מוכר → throw new Error("סוג לא מוכר: <kind>")
// בסוף הקובץ: module.exports = { predictOrder };
//
// הרצה:   node 10-async/starter/P10-E44.js
// בדיקה:  npm run check P10-E44
