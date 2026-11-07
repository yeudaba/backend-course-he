const savedShippingFee = 0;
const savedClubDiscount = 0;
const stock = 0;

const shippingFee = savedShippingFee ?? 25;
const clubDiscount = savedClubDiscount ?? 5;

console.log("דמי משלוח:", shippingFee);
console.log(`הנחת מועדון: ${clubDiscount}%`);
if (stock === undefined) {
  console.log("מלאי: לא ידוע");
} else if (stock === 0) {
  console.log("מלאי: אזל");
} else {
  console.log("מלאי:", stock);
}
