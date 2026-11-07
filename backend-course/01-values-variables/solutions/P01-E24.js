const shippingFee = 30;
let itemsCount = 0;
let cartTotal = 0;

const item1Name = "מקלדת";
const item1Price = 250;
itemsCount = itemsCount + 1;
cartTotal = cartTotal + item1Price;
console.log("נוסף:", item1Name, "| פריטים:", itemsCount, "| סכום:", cartTotal);

const item2Name = "עכבר";
const item2Price = 90;
itemsCount = itemsCount + 1;
cartTotal = cartTotal + item2Price;
console.log("נוסף:", item2Name, "| פריטים:", itemsCount, "| סכום:", cartTotal);

const item3Name = "משטח לעכבר";
const item3Price = 35;
itemsCount = itemsCount + 1;
cartTotal = cartTotal + item3Price;
console.log("נוסף:", item3Name, "| פריטים:", itemsCount, "| סכום:", cartTotal);

const item4Name = "כבל USB";
const item4Price = 25;
itemsCount = itemsCount + 1;
cartTotal = cartTotal + item4Price;
console.log("נוסף:", item4Name, "| פריטים:", itemsCount, "| סכום:", cartTotal);

const totalToPay = cartTotal + shippingFee;
console.log("---");
console.log("סכום העגלה:", cartTotal);
console.log("דמי משלוח:", shippingFee);
console.log("לתשלום:", totalToPay);
