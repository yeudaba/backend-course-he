const rows = "ABC";
const seatsPerRow = 5;
let total = 0;

for (const row of rows) {
  let line = "";
  for (let seat = 1; seat <= seatsPerRow; seat++) {
    line += `${row}${seat} `;
    total++;
  }
  console.log(line.trim());
}
console.log("סה״כ כיסאות:", total);
