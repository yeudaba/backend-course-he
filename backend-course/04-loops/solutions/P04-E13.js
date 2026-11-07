const start = 6;
let n = start;
let steps = 0;
let path = String(n);

while (n !== 1) {
  if (n % 2 === 0) {
    n = n / 2;
  } else {
    n = n * 3 + 1;
  }
  steps++;
  path += ` → ${n}`;
}

console.log(path);
console.log(`צעדים: ${steps}`);
