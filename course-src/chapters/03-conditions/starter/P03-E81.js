// P03-E81: דמי משלוח — אף אחד לא מקבל משלוח חינם. יש כאן שלוש תקלות.
// 200 ומעלה ← 0. מ־100 עד מתחת ל־200 ← 15. מתחת ל־100 ← 30.
// כשהמשלוח לא חינם — שורה נוספת: כמה חסר ל־200.
//
// הרצה:   node 03-conditions/starter/P03-E81.js
// בדיקה:  npm run check P03-E81
const total = 250;
let fee = 30;
if (total >= 100) {
  fee = 15;
} else if (total > 200) {
  fee = 0;
}
console.log("סכום:", total);
console.log("דמי משלוח:", fee);
if (fee !== "0") {
  console.log(`עוד ${200 - total} ש״ח למשלוח חינם`);
}
