const startHour = 6;
const endHour = 8;
const intervalMinutes = 25;
for (let t = startHour * 60; t <= endHour * 60; t += intervalMinutes) {
  const hh = `${Math.floor(t / 60)}`.padStart(2, "0");
  const mm = `${t % 60}`.padStart(2, "0");
  console.log(`${hh}:${mm}`);
}
