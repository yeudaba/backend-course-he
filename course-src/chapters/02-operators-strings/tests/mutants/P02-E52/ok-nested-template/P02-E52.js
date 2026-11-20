// P02-E52: מספר הזמנה עם אפסים
// הדפס: הזמנה נוכחית ORD-00042, הזמנה הבאה (עם orderNumber++), סוג המזהה, אורך המזהה.
// 5 ספרות עם אפסים מובילים: padStart.
//
// הרצה:   node 02-operators-strings/starter/P02-E52.js
// בדיקה:  npm run check P02-E52

let orderNumber = 42;
const currentId = `ORD-${`${orderNumber}`.padStart(5, "0")}`;
orderNumber++;
const nextId = `ORD-${`${orderNumber}`.padStart(5, "0")}`;
console.log(`הזמנה נוכחית: ${currentId}`);
console.log(`הזמנה הבאה: ${nextId}`);
console.log(`סוג המזהה: ${typeof currentId}`);
console.log(`אורך המזהה: ${currentId.length}`);
