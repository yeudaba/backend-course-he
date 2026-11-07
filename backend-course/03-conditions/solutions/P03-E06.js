const requestedInput = "12";
const stock = 9;

const requested = Number(requestedInput);
const hasEnough = stock >= requested;
const missing = Math.max(0, requested - stock);

console.log(`ביקשו: ${requested}, במלאי: ${stock}`);
console.log(`יש מספיק? ${hasEnough}`);
console.log(`חסרות: ${missing}`);
