const weight = 23.4;
let price;

if (weight <= 0) {
  price = null;
} else if (weight <= 1) {
  price = 25;
} else if (weight <= 5) {
  price = 40;
} else if (weight <= 20) {
  price = 70;
} else {
  price = 70 + Math.ceil(weight - 20) * 5;
}

if (price === null) {
  console.log("שגיאה: משקל חייב להיות חיובי");
} else {
  console.log(`משקל ${weight} ק״ג: ${price} ש״ח`);
}
