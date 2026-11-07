const productName = "כיסא משרדי";
const startStock = 40;
let stock = startStock;
let sold = 0;
let returned = 0;

stock = stock - 12;
sold = sold + 12;

stock = stock - 7;
sold = sold + 7;

stock = stock + 2;
returned = returned + 2;

stock = stock - 15;
sold = sold + 15;

console.log("מוצר:", productName);
console.log("מלאי בתחילת היום:", startStock);
console.log("נמכרו:", sold);
console.log("הוחזרו:", returned);
console.log("מלאי בסוף היום:", stock);
