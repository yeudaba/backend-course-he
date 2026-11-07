const notebookPrice = 12;
const notebookQty = 3;
const penPrice = 7;
const penQty = 2;
const shipping = 15;

const notebooksTotal = notebookQty * notebookPrice;
const pensTotal = penQty * penPrice;
const total = notebooksTotal + pensTotal + shipping;

console.log(`${notebookQty} x מחברת = ${notebooksTotal}`);
console.log(`${penQty} x עט = ${pensTotal}`);
console.log(`משלוח: ${shipping}`);
console.log(`סה״כ לתשלום: ${total}`);
