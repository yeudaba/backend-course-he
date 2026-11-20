const eggs = 50;
const full = Math.floor(eggs / 12);
const left = eggs % 12;
const boxes = full + 1;
console.log("קרטונים מלאים:", full);
console.log("ביצים בחוץ:", left);
console.log("קרטונים לכל הביצים:", boxes);
