// P03-E81: דמי משלוח — מתוקן
const total = 250;
let fee = 30;
if (total >= 200) {
  fee = 0;
} else if (total >= 100) {
  fee = 15;
}
console.log("סכום:", total);
console.log("דמי משלוח:", fee);
if (fee !== 0) {
  console.log(`עוד ${200 - total} ש״ח למשלוח חינם`);
}
