// P03-E22: הגדרות של חנות. 0 הוא ערך חוקי לכל השדות!
// הפלט הרצוי:
// דמי משלוח: 0
// הנחת מועדון: 0%
// מלאי: אזל
const savedShippingFee = 0;      // החנות החליטה: משלוח חינם
const savedClubDiscount = 0;     // אין הנחת מועדון כרגע
const stock = 0;

const shippingFee = savedShippingFee || 25;
const clubDiscount = savedClubDiscount || 5;

console.log("דמי משלוח:", shippingFee);
console.log(`הנחת מועדון: ${clubDiscount}%`);
if (stock) {
  console.log("מלאי:", stock);
} else if (stock === 0) {
  console.log("מלאי: אזל");
}
