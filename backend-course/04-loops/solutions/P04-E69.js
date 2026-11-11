const distanceKm = 7;
const isNight = false;
let fare = 0;
for (let km = 1; km <= distanceKm; km++) {
  fare += km <= 2 ? 12 : 8;
}
if (isNight) {
  fare *= 1.25;
}
console.log(`נסיעה של ${distanceKm} ק״מ (${isNight ? "לילה" : "יום"}): ${fare.toFixed(2)} ₪`);
