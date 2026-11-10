const goal = 100;

let sum = 0;
let n = 0;
while (sum < goal) {
  n++;
  sum += n;
}

console.log(`הגענו ל־${sum} אחרי ${n} מספרים`);
