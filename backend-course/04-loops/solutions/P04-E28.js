const from = -10;
const to = 40;
const step = 10;

for (let c = from; c <= to; c += step) {
  const f = (c * 9) / 5 + 32;
  let label;
  if (c < 10) {
    label = "קר";
  } else if (c <= 25) {
    label = "נעים";
  } else {
    label = "חם";
  }
  console.log(`${String(c).padStart(3)}°C = ${f.toFixed(1).padStart(5)}°F (${label})`);
}
