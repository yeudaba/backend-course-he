const minutesParked = 135;

const firstHour = 12;
const perQuarter = 3.5;
const dailyMax = 80;

let price;
if (minutesParked <= 15) {
  price = 0;
} else if (minutesParked <= 60) {
  price = firstHour;
} else {
  const quarters = Math.ceil((minutesParked - 60) / 15);
  price = Math.min(dailyMax, firstHour + quarters * perQuarter);
}

const hours = Math.floor(minutesParked / 60);
const minutes = String(minutesParked % 60).padStart(2, "0");
console.log(`${hours}:${minutes} שעות חניה — לתשלום: ${price.toFixed(2)} ₪`);
