const celsiusInput = "36.6";
const celsius = Number(celsiusInput);
const fahrenheit = celsius * 9 / 5 + 32;
const shown = fahrenheit.toFixed(1);
console.log(`${celsius}°C = ${shown}°F`);
console.log(`סוג התוצאה: ${typeof shown}`);
