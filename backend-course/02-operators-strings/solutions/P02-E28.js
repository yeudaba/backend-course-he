const previousReading = "10450";
const currentReading = " 10712 ";
const pricePerKwh = 0.6402;
const vatPercent = 18;

const used = Number(currentReading) - Number(previousReading);
const cost = used * pricePerKwh;
const withVat = cost * (1 + vatPercent / 100);

console.log(`צריכה: ${used} קוט״ש`);
console.log(`לפני מע״מ: ${cost.toFixed(2)} ₪`);
console.log(`כולל מע״מ (${vatPercent}%): ${withVat.toFixed(2)} ₪`);
