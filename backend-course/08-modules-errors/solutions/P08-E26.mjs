// P08-E26: סכום עגלה, באגורות
import { toAgorot, formatILS } from "./P08-E26-money.mjs";

export function cartTotal(prices) {
  const total = prices.map(toAgorot).reduce((sum, a) => sum + a, 0);
  return formatILS(total);
}

console.log(cartTotal([19.9, 0.1, 5]));
console.log(cartTotal([0.1, 0.2]));
