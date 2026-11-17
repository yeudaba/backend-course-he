const quantityInput = " 3 ";
const stock = 10;
const quantity = Number(quantityInput);
if (Number.isNaN(quantity)) {
  console.log("שגיאה: הכמות חייבת להיות מספר");
} else if (quantity > stock) {
  console.log(`יש רק ${stock} במלאי`);
} else {
  console.log(`הוזמנו ${quantity}. נשארו ${stock - quantity} במלאי`);
}
