const day = 6;
let name;

switch (day) {
  case 1:
    name = "ראשון";
    break;
  case 2:
    name = "שני";
    break;
  case 3:
    name = "שלישי";
    break;
  case 4:
    name = "רביעי";
    break;
  case 5:
    name = "חמישי";
    break;
  case 6:
    name = "שישי";
    break;
  case 7:
    name = "שבת";
    break;
  default:
    name = null;
}

if (name === null) {
  console.log("יום לא חוקי");
} else {
  const weekend = day >= 6 ? " (סוף שבוע)" : "";
  console.log(`יום ${day}: ${name}${weekend}`);
}
