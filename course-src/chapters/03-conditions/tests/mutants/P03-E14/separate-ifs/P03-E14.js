const year = 1900;

let kind = "רגילה";
if (year % 400 === 0) {
  kind = "מעוברת";
} else if (year % 100 === 0) {
  kind = "רגילה";
}
if (year % 4 === 0) {
  kind = "מעוברת";
}
console.log(`${year}: ${kind}`);
