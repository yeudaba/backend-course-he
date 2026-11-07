const cardNumber = "4580123412345678";
const last4 = cardNumber.slice(-4);

console.log(`**** **** **** ${last4}`);
console.log(`כרטיס שמסתיים ב־${last4} (${cardNumber.length} ספרות)`);

// בונוס: עובד לכל אורך
const masked = last4.padStart(cardNumber.length, "*");
console.log(masked);
