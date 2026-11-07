const age = 70;
const isWeekend = true;
const isMember = true;

let base;
if (age <= 12) {
  base = 30;
} else if (age <= 64) {
  base = 45;
} else {
  base = 25;
}

const surcharge = isWeekend && age < 65 ? 10 : 0;
const beforeDiscount = base + surcharge;
const discount = isMember ? beforeDiscount * 0.2 : 0;
const total = beforeDiscount - discount;

console.log(`גיל ${age}, ${isWeekend ? "סופ״ש" : "אמצע שבוע"}, ${isMember ? "חבר מועדון" : "לא חבר"}`);
console.log(`מחיר בסיס: ${base}`);
console.log(`תוספת סופ״ש: ${surcharge}`);
console.log(`הנחת מועדון: ${discount.toFixed(2)}`);
console.log(`לתשלום: ${total.toFixed(2)}`);
