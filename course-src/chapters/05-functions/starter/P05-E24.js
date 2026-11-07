// P05-E24: תהליך הזמנה מפורק לפונקציות
// מחירון: KB-101 → 199 | KB-102 → 249 | MS-201 → 89

// מנקה רווחים, אותיות גדולות. מוצר לא קיים → null
function getUnitPrice(code) {
  // כתוב כאן
}

// מחזירה null אם תקין, אחרת אחת ההודעות:
// "כמות חייבת להיות מספר"                    (ריק או לא מספר)
// `כמות חייבת להיות מספר שלם בין 1 ל־${max}` (לא שלם / קטן מ־1 / גדול מ־max)
function validateQuantity(input, max = 5) {
  // כתוב כאן
}

// מחזירה סכום הנחה. קופון ריק → 0
// VIP20: 20% מה־subtotal, רק אם subtotal > 500 (אחרת null)
// WELCOME: 30 (אבל לא יותר מה־subtotal)
// קופון אחר → null
function couponDiscount(coupon, subtotal) {
  // כתוב כאן
}

// מחזירה מחרוזת אחת, לפי הסדר:
// לא מחובר     → "שגיאה: יש להתחבר כדי להזמין"
// מוצר לא קיים → "שגיאה: מוצר לא קיים"
// כמות לא תקינה → "שגיאה: " + הודעת validateQuantity
// קופון null   → "שגיאה: הקופון לא קיים או לא תקף להזמנה הזו"
// אחרת         → "לתשלום: 597.60" (2 ספרות)
function checkout(code, quantityInput, coupon, isLoggedIn) {
  // כתוב כאן
}

console.log(checkout(" kb-102 ", "3", "VIP20", true)); // "לתשלום: 597.60"

module.exports = { getUnitPrice, validateQuantity, couponDiscount, checkout };
