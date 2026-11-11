const minutesParked = 135;
const pricePerHour = 12;
const hoursCharged = Math.ceil(minutesParked / 60);
const toPay = hoursCharged * pricePerHour;
console.log("זמן חניה:", minutesParked, "דקות");
console.log("שעות לחיוב:", hoursCharged);
console.log("לתשלום:", toPay);
console.log("סוג הסכום:", typeof toPay);
