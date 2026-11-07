const item1 = "  mouse  ";
const price1 = "89.9";
const item2 = "keyboard";
const price2 = " 249 ";
const item3 = "USB cable";
const price3 = "19.5";
const couponPercent = "10";
const vatRate = 0.18;
const nameWidth = 20;
const priceWidth = 8;

const name1 = item1.trim().toUpperCase();
const name2 = item2.trim().toUpperCase();
const name3 = item3.trim().toUpperCase();
const p1 = Number(price1);
const p2 = Number(price2);
const p3 = Number(price3);
const coupon = Number(couponPercent);

const subtotal = p1 + p2 + p3;
const discount = (subtotal * coupon) / 100;
const afterDiscount = subtotal - discount;
const vat = afterDiscount * vatRate;
const total = afterDiscount + vat;

console.log(name1.padEnd(nameWidth, ".") + p1.toFixed(2).padStart(priceWidth));
console.log(name2.padEnd(nameWidth, ".") + p2.toFixed(2).padStart(priceWidth));
console.log(name3.padEnd(nameWidth, ".") + p3.toFixed(2).padStart(priceWidth));
console.log("-".repeat(nameWidth + priceWidth));
console.log("SUBTOTAL".padEnd(nameWidth, ".") + subtotal.toFixed(2).padStart(priceWidth));
console.log(`COUPON (${coupon}%)`.padEnd(nameWidth, ".") + (-discount).toFixed(2).padStart(priceWidth));
console.log("VAT (18%)".padEnd(nameWidth, ".") + vat.toFixed(2).padStart(priceWidth));
console.log("TOTAL".padEnd(nameWidth, ".") + total.toFixed(2).padStart(priceWidth));
