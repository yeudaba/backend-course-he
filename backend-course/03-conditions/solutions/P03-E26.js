const hour = 14;
const isSaturday = false;

if (isSaturday) {
  console.log("שבת — סגור");
} else if (hour >= 8 && hour < 20) {
  const left = 20 - hour;
  const leftText = left === 1 ? "שעה" : `${left} שעות`;
  console.log(`${hour}:00 — פתוח (נסגר בעוד ${leftText})`);
} else {
  console.log(`${hour}:00 — סגור`);
}
