// P02-E52: מספר הזמנה עם אפסים
// הדפס: הזמנה נוכחית ORD-00042, הזמנה הבאה (עם orderNumber++), סוג המזהה, אורך המזהה.
// 5 ספרות עם אפסים מובילים: padStart.
//
// הרצה:   node 02-operators-strings/starter/P02-E52.js
// בדיקה:  npm run check P02-E52

let orderNumber = 42;
const currentId = `ORD-${`00000${orderNumber}`.slice(-5)}`;
orderNumber++;
const nextId = `ORD-${`00000${orderNumber}`.slice(-5)}`;
console.log(`הזמנה נוכחית: ${currentId}`);
console.log(`הזמנה הבאה: ${nextId}`);
console.log(`סוג המזהה: ${typeof currentId}`);
console.log(`אורך המזהה: ${currentId.length}`);
