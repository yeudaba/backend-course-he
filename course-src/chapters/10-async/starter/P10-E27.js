// P10-E27: סכום הזמנה במקביל (חזרה על map, reduce ו־destructuring)
// כתוב async function orderTotal(items, getPrice):
//   items = [{ sku, qty }], getPrice(sku) מחזירה Promise עם המחיר
//   מחזירה את סכום price × qty. כל המחירים נשלפים במקביל. מחיר שנכשל → orderTotal נכשלת עם אותה שגיאה.
// בסוף הקובץ: module.exports = { orderTotal };
//
// הרצה:   node 10-async/starter/P10-E27.js
// בדיקה:  npm run check P10-E27
