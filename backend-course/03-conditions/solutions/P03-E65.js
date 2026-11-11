const age = 24;
const isStudent = true;
const isSoldier = false;
const price = 50;
const isEligible = (isStudent || isSoldier) && age < 30;
let finalPrice = price;
if (isEligible) {
  finalPrice = price * 0.8;
}
console.log(`זכאי להנחה? ${isEligible}`);
console.log(`מחיר: ${finalPrice} ₪`);
