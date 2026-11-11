const readings = "3719462";
let max = Number(readings[0]);
let maxAt = 0;
let min = Number(readings[0]);
let sum = 0;
for (let i = 0; i < readings.length; i++) {
  const value = Number(readings[i]);
  sum += value;
  if (value > max) {
    max = value;
    maxAt = i;
  }
  if (value < min) {
    min = value;
  }
}
console.log(`מקסימום: ${max} (בדקה ${maxAt})`);
console.log(`מינימום: ${min}`);
console.log(`סכום: ${sum}`);
