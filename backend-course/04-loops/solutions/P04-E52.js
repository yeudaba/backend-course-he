const from = 3;
const to = 11;
let sum = 0;
let count = 0;
for (let i = from; i <= to; i++) {
  if (i % 2 !== 0) {
    sum += i;
    count++;
  }
}
console.log(`סכום האי־זוגיים בין ${from} ל־${to}: ${sum} (${count} מספרים)`);
