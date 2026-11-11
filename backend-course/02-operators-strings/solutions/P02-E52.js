let orderNumber = 42;
const currentDigits = `${orderNumber}`.padStart(5, "0");
const currentId = `ORD-${currentDigits}`;
orderNumber++;
const nextId = `ORD-${`${orderNumber}`.padStart(5, "0")}`;
console.log(`הזמנה נוכחית: ${currentId}`);
console.log(`הזמנה הבאה: ${nextId}`);
console.log(`סוג המזהה: ${typeof currentId}`);
console.log(`אורך המזהה: ${currentId.length}`);
