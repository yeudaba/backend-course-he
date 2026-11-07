// P02-E22: חישוב מחיר עם הנחה. הקוד רץ — אבל התוצאות שגויות.
// הפלט הרצוי:
// מחיר מקורי: 120.00
// הנחה (15%): 18.00
// אחרי הנחה: 102.00
// כולל משלוח: 122.00
const priceInput = "120";
const discountPercent = 15;
const shipping = 20;

const price = priceInput;
const discount = (price * discountPercent / 100).toFixed(2);
const afterDiscount = price - discount;
const withShipping = afterDiscount.toFixed(2) + shipping;

console.log("מחיר מקורי:", price);
console.log(`הנחה (${discountPercent}%):`, discount);
console.log("אחרי הנחה:", afterDiscount);
console.log("כולל משלוח:", withShipping);
