const ticketsInput = "4";
const ticketPriceInput = "62.5";

const tickets = Number(ticketsInput);
const ticketPrice = Number(ticketPriceInput);
const total = tickets * ticketPrice;

console.log(`${tickets} כרטיסים × ${ticketPrice} = ${total}`);
console.log(`סוג התוצאה: ${typeof total}`);
