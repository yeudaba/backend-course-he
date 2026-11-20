const year = 1900;

let kind;
if (year % 400 === 0) {
  kind = "מעוברת";
} else if (year % 100 === 0) {
  kind = "רגילה";
} else if (year % 4 === 0) {
  kind = "מעוברת";
} else {
  kind = "רגילה";
}
console.log(`${year}: ${kind}`);
