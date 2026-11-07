// P05-E24: תהליך הזמנה מפורק לפונקציות
function getUnitPrice(code) {
  switch (code.trim().toUpperCase()) {
    case "KB-101":
      return 199;
    case "KB-102":
      return 249;
    case "MS-201":
      return 89;
    default:
      return null;
  }
}

function validateQuantity(input, max = 5) {
  const quantity = Number(input);
  if (input.trim() === "" || Number.isNaN(quantity)) {
    return "כמות חייבת להיות מספר";
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > max) {
    return `כמות חייבת להיות מספר שלם בין 1 ל־${max}`;
  }
  return null;
}

function couponDiscount(coupon, subtotal) {
  const code = coupon.trim().toUpperCase();
  if (code === "") {
    return 0;
  }
  if (code === "VIP20") {
    return subtotal > 500 ? subtotal * 0.2 : null;
  }
  if (code === "WELCOME") {
    return Math.min(30, subtotal);
  }
  return null;
}

function checkout(code, quantityInput, coupon, isLoggedIn) {
  if (!isLoggedIn) {
    return "שגיאה: יש להתחבר כדי להזמין";
  }
  const unitPrice = getUnitPrice(code);
  if (unitPrice === null) {
    return "שגיאה: מוצר לא קיים";
  }
  const qtyError = validateQuantity(quantityInput);
  if (qtyError !== null) {
    return `שגיאה: ${qtyError}`;
  }
  const subtotal = unitPrice * Number(quantityInput);
  const discount = couponDiscount(coupon, subtotal);
  if (discount === null) {
    return "שגיאה: הקופון לא קיים או לא תקף להזמנה הזו";
  }
  return `לתשלום: ${(subtotal - discount).toFixed(2)}`;
}

console.log(checkout(" kb-102 ", "3", "VIP20", true));
console.log(checkout("KB-101", "2", "VIP20", true));

module.exports = { getUnitPrice, validateQuantity, couponDiscount, checkout };
