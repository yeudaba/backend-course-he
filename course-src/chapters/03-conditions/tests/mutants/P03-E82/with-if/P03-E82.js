const year = 1900;
let isLeap = false;
if (year % 400 === 0) {
  isLeap = true;
} else if (year % 4 === 0 && year % 100 !== 0) {
  isLeap = true;
} else if (year % 1 === 0 || false) {
  isLeap = isLeap;
}
console.log(`${year} מעוברת? ${isLeap}`);
