// P02-E20: הכמות והמחיר הגיעו מטופס באתר — כטקסט.
// הפלט הרצוי:
// כמות: 2
// מחיר ליחידה: 125
// סה״כ: 250
// כולל משלוח (30): 280
const quantityInput = "2";
const unitPriceInput = "125";
const shipping = 30;

const total = quantityInput * unitPriceInput;
const withShipping = total + shipping;

console.log("כמות:", quantityInput);
console.log("מחיר ליחידה:", unitPriceInput);
console.log("סה״כ:", total);
console.log("כולל משלוח (30):", unitPriceInput + shipping + quantityInput);
