const items = 3;
const total = 149.7;
if (items === 0) {
  console.log("העגלה ריקה");
} else if (items === 1) {
  console.log(`יש לך פריט אחד בעגלה (${total.toFixed(2)} ₪)`);
} else {
  console.log(`יש לך ${items} פריטים בעגלה (${total.toFixed(2)} ₪)`);
}
