const distanceKm = 130;
const speedKmh = 90;
const minutes = Math.round(distanceKm / speedKmh * 60);
if (minutes < 60) {
  console.log(`זמן נסיעה: ${minutes} דקות`);
} else {
  const hours = Math.floor(minutes / 60);
  const rest = `${minutes % 60}`.padStart(2, "0");
  console.log(`זמן נסיעה: ${hours}:${rest} שעות`);
}
if (minutes > 120) {
  console.log("מומלץ לעצור להפסקה");
}
