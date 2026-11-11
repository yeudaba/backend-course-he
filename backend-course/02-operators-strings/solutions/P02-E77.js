const name = " dana ";
const year = 2026;
const serial = 7;
// " dana ".trim() ← "dana" ← .slice(0, 3) ← "dan" ← .toUpperCase() ← "DAN"
// 2026 % 100 ← 26 ;  `${7}` ← "7" ← .padStart(3, "0") ← "007"
const coupon = `${name.trim().slice(0, 3).toUpperCase()}${year % 100}-${`${serial}`.padStart(3, "0")}`;
console.log(coupon);
console.log(`אורך: ${coupon.length}`);
