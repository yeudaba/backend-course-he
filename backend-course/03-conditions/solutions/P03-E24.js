const productCode = " kb-102 ";
const quantityInput = "3";
const couponInput = "VIP20";
const isLoggedIn = true;

const maxQuantity = 5;
const code = productCode.trim().toUpperCase();
const coupon = couponInput.trim().toUpperCase();
const quantity = Number(quantityInput);

let unitPrice;
switch (code) {
  case "KB-101":
    unitPrice = 199;
    break;
  case "KB-102":
    unitPrice = 249;
    break;
  case "MS-201":
    unitPrice = 89;
    break;
  default:
    unitPrice = null;
}

const subtotal = unitPrice === null ? 0 : unitPrice * quantity;
const isKnownCoupon = coupon === "" || coupon === "VIP20" || coupon === "WELCOME";

let discount = 0;
if (coupon === "VIP20") {
  discount = subtotal * 0.2;
} else if (coupon === "WELCOME") {
  discount = Math.min(30, subtotal);
}

if (!isLoggedIn) {
  console.log("שגיאה: יש להתחבר כדי להזמין");
} else if (unitPrice === null) {
  console.log(`שגיאה: מוצר ${code} לא קיים`);
} else if (quantityInput.trim() === "" || Number.isNaN(quantity)) {
  console.log("שגיאה: כמות חייבת להיות מספר");
} else if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity) {
  console.log(`שגיאה: כמות חייבת להיות מספר שלם בין 1 ל־${maxQuantity}`);
} else if (!isKnownCoupon) {
  console.log(`שגיאה: קופון ${coupon} לא קיים`);
} else if (coupon === "VIP20" && subtotal <= 500) {
  console.log("שגיאה: קופון VIP20 תקף רק לרכישה מעל 500");
} else {
  const total = subtotal - discount;
  console.log(`מוצר: ${code} × ${quantity}`);
  console.log(`ביניים: ${subtotal.toFixed(2)}`);
  if (coupon !== "") {
    console.log(`קופון ${coupon}: -${discount.toFixed(2)}`);
  }
  console.log(`לתשלום: ${total.toFixed(2)}`);
}
