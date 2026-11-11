const qty = "3";
const price = 20;
const shipping = 15;
const count = Number(qty);
const sum = count * price + shipping;
console.log(`פריטים: ${count + 1}`);
console.log(`סכום: ${sum}`);
console.log(`ממוצע לפריט: ${sum / count}`);
