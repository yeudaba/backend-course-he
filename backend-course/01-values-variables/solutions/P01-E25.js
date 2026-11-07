let a = "אדום";
let b = "ירוק";
let c = "כחול";
console.log("לפני:", a, b, c);

const temp = a;
a = b;
b = c;
c = temp;

console.log("אחרי:", a, b, c);
