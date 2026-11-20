const price = 240;
const discount = price * 15 / 100;
const toPay = Math.min(price - discount, 50);
console.log("מחיר:", price);
console.log("הנחה:", discount);
console.log("לתשלום:", toPay);
