const price = 240;
const discount = Math.max(price * 15 / 100, 50);
const toPay = price - discount;
console.log("מחיר:", price);
console.log("הנחה:", discount);
console.log("לתשלום:", toPay);
