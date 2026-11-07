let count = 0;
let sum = 0;
for (let i = 1; i < 50; i++) {
  if (i % 3 === 0 || i % 5 === 0) {
    count++;
    sum += i;
  }
}
console.log(`כמות: ${count}`);
console.log(`סכום: ${sum}`);
