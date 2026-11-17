const start = 100;
const target = 1000000;
let count = start;
let doublings = 0;
while (count <= target) {
  count *= 2;
  doublings++;
}
const minutes = doublings * 20;
const hours = Math.floor(minutes / 60);
const rest = `${minutes % 60}`.padStart(2, "0");
console.log(`אחרי ${doublings} הכפלות (${hours}:${rest} שעות): ${count} חיידקים`);
