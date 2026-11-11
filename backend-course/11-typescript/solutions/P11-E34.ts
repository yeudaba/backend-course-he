// P11-E34: מחיר עם מע״מ
export function priceWithVat(price: number, vat: number): number {
  return Math.round(price * (1 + vat) * 100) / 100;
}

console.log(priceWithVat(100, 0.18));
console.log(priceWithVat(9.99, 0.17));
