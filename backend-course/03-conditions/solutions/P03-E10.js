const total = 250;
const isClubMember = false;

const freeShipping = total >= 200 || isClubMember;
const shipping = freeShipping ? 0 : 29.9;
const toPay = total + shipping;

console.log(`משלוח: ${shipping.toFixed(2)} | לתשלום: ${toPay.toFixed(2)}`);
