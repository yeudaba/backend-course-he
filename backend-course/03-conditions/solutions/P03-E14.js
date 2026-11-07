const year = 1900;

// גרסה 1: if / else if
let isLeap;
if (year % 400 === 0) {
  isLeap = true;
} else if (year % 100 === 0) {
  isLeap = false;
} else if (year % 4 === 0) {
  isLeap = true;
} else {
  isLeap = false;
}
console.log(`${year}: ${isLeap ? "מעוברת" : "רגילה"}`);

// גרסה 2: ביטוי אחד
const isLeap2 = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
console.log(`${year}: ${isLeap2 ? "מעוברת" : "רגילה"}`);
