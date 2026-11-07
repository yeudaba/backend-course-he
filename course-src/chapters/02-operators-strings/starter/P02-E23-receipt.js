// P02-E23: הקבלה מדפיסה סכומים מוזרים. הפלט הרצוי:
// 3 x מחברת = 36
// 2 x עט = 14
// משלוח: 15
// סה״כ לתשלום: 65
const notebookPrice = 12;
const notebookQty = 3;
const penPrice = 7;
const penQty = 2;
const shipping = 15;

console.log(notebookQty + " x מחברת = " + notebookQty * notebookPrice);
console.log(penQty + " x עט = " + penQty + penPrice);
console.log("משלוח: " + shipping);
console.log("סה״כ לתשלום: " + notebookQty * notebookPrice + penQty * penPrice + shipping);
