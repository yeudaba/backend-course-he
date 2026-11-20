// P05-E81: דמי משלוח — כולם מקבלים משלוח חינם, וסכום שלילי מחזיר מספר. שלוש תקלות.
// null ← total לא מספר או שלילי · 0 ← חבר מועדון · 0 ← 200 ומעלה · 25 ← כל השאר
//
// הרצה:   node 05-functions/starter/P05-E81.js
// בדיקה:  npm run check P05-E81
function shippingFee(total, isMember = "false") {
  if (typeof total !== "number" || total < 0) {
    console.log("סכום לא תקין:", total);
  }
  if (isMember) {
    return 0;
  }
  if (total > 200) {
    return 0;
  }
  return 25;
}

console.log(shippingFee(100), shippingFee(100, true), shippingFee(200), shippingFee(-5), shippingFee("abc"));

module.exports = { shippingFee };
