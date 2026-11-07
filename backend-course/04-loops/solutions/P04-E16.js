const original = 90517;
let n = original;
let digitSum = 0;
let digitCount = 0;

while (n > 0) {
  digitSum += n % 10;
  digitCount++;
  n = Math.floor(n / 10);
}

console.log(`סכום ספרות: ${digitSum}`);
console.log(`מספר ספרות: ${digitCount}`);

// פתרון שני — עם מחרוזת
let sum2 = 0;
for (const ch of String(original)) {
  sum2 += Number(ch);
}
console.log(`(דרך מחרוזת: ${sum2})`);
