const startPrice = 1000;
const targetPrice = 500;
let price = startPrice;
let week = 0;
while (price >= targetPrice) {
  price *= 0.9;
  week++;
  console.log(`שבוע ${week}: ${price.toFixed(2)}`);
}
console.log(`ירד מתחת ל־${targetPrice} אחרי ${week} שבועות`);
