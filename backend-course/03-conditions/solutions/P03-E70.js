const orderHour = 11;
const isWeekday = true;
const distanceKm = 18;
const total = 120;
const isClubMember = false;
const isSameDay = isWeekday && orderHour < 14 && distanceKm <= 30;
const isFree = total >= 300 || isClubMember;
let fee = 15 + Math.max(0, distanceKm - 10) * 2;
if (isFree) {
  fee = 0;
}
console.log(`משלוח היום? ${isSameDay}`);
console.log(`דמי משלוח: ${fee.toFixed(2)} ₪`);
