const day = 29;
const month = 2;
const year = 2024;

const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

let daysInMonth;
switch (month) {
  case 4:
  case 6:
  case 9:
  case 11:
    daysInMonth = 30;
    break;
  case 2:
    daysInMonth = isLeap ? 29 : 28;
    break;
  default:
    daysInMonth = 31;
}

const allIntegers = Number.isInteger(day) && Number.isInteger(month) && Number.isInteger(year);
const date = `${day}/${month}/${year}`;

if (!allIntegers) {
  console.log(`${date}: יום, חודש ושנה חייבים להיות מספרים שלמים`);
} else if (year < 1900 || year > 2100) {
  console.log(`${date}: שנה מחוץ לטווח`);
} else if (month < 1 || month > 12) {
  console.log(`${date}: אין חודש ${month}`);
} else if (day < 1 || day > daysInMonth) {
  console.log(`${date}: בחודש ${month} יש ${daysInMonth} ימים`);
} else {
  console.log(`${date}: תאריך חוקי`);
}
