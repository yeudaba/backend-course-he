const weightInput = "2.5";
const basePrice = 20;
const pricePerKg = 8;
const weight = Number(weightInput);
// 20 + 2.5 * 8 ← 20 + 20 ← 40
const weightCost = weight * pricePerKg;
const total = basePrice + weightCost;
console.log(`משקל: ${weight} ק״ג`);
console.log(`תוספת משקל: ${weightCost}`);
console.log(`לתשלום: ${total.toFixed(2)} ₪`);
