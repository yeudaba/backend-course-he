function minutesToText(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = `${totalMinutes % 60}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

console.log(minutesToText(135), minutesToText(5));

module.exports = { minutesToText };
