const status = 403;
let message;

switch (status) {
  case 200:
  case 201:
    message = "הצלחה";
    break;
  case 400:
    message = "בקשה שגויה";
    break;
  case 401:
  case 403:
    message = "אין הרשאה";
    break;
  case 404:
    message = "לא נמצא";
    break;
  case 500:
  case 502:
  case 503:
    message = "תקלה בשרת";
    break;
  default:
    message = "קוד לא מוכר";
}

console.log(`${status}: ${message}`);
