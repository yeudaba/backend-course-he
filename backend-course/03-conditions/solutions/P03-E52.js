const cityInput = " Tel Aviv ";
const city = cityInput.trim().toLowerCase();
let shipping;
if (city === "tel aviv") {
  shipping = 0;
} else if (city === "jerusalem") {
  shipping = 20;
} else if (city === "haifa") {
  shipping = 25;
} else {
  shipping = 35;
}
console.log(`משלוח ל־${city}: ${shipping} ₪`);
