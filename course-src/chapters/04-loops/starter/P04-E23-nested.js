// P04-E23: לוח מושבים של אולם — 3 שורות, 5 כיסאות בכל שורה.
// הפלט הרצוי:
// A1 A2 A3 A4 A5
// B1 B2 B3 B4 B5
// C1 C2 C3 C4 C5
// סה״כ כיסאות: 15
const rows = "ABC";
const seatsPerRow = 5;
let total = 0;
let line = "";

for (const row of rows) {
  for (let seat = 1; seat <= seatsPerRow; seat++) {
    line += `${row}${seat} `;
  }
  total++;
  console.log(line.trim());
}
console.log("סה״כ כיסאות:", total);
