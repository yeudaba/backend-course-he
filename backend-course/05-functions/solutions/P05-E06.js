// P05-E06: המרת פרנהייט לצלזיוס
function toCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

console.log(toCelsius(212));

module.exports = { toCelsius };
