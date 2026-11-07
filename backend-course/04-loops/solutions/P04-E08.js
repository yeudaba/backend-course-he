let total = 0;
let evenSum = 0;
let evenCount = 0;

for (let i = 1; i <= 100; i++) {
  total += i;
  if (i % 2 === 0) {
    evenSum += i;
    evenCount++;
  }
}

console.log(`סכום 1..100: ${total}`);
console.log(`ממוצע הזוגיים: ${evenSum / evenCount}`);
