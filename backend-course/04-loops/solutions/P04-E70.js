const fromYear = 2025;
let nextLeap = fromYear + 1;
while (!((nextLeap % 4 === 0 && nextLeap % 100 !== 0) || nextLeap % 400 === 0)) {
  nextLeap++;
}
let leapCount = 0;
for (let y = 2000; y <= 2100; y++) {
  if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) {
    leapCount++;
  }
}
console.log(`השנה המעוברת הבאה אחרי ${fromYear}: ${nextLeap}`);
console.log(`בין 2000 ל־2100 יש ${leapCount} שנים מעוברות`);
