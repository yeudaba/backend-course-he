const quantityInput = "2";
const unitPriceInput = "125";
const shipping = 30;

const quantity = Number(quantityInput);
const unitPrice = Number(unitPriceInput);
const total = quantity * unitPrice;
const withShipping = total + shipping;

console.log("כמות:", quantity);
console.log("מחיר ליחידה:", unitPrice);
console.log("סה״כ:", total);
console.log("כולל משלוח (30):", withShipping);
