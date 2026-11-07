const priceInput = "120";
const discountPercent = 15;
const shipping = 20;

const price = Number(priceInput);
const discount = (price * discountPercent) / 100;
const afterDiscount = price - discount;
const withShipping = afterDiscount + shipping;

console.log("מחיר מקורי:", price.toFixed(2));
console.log(`הנחה (${discountPercent}%):`, discount.toFixed(2));
console.log("אחרי הנחה:", afterDiscount.toFixed(2));
console.log("כולל משלוח:", withShipping.toFixed(2));
