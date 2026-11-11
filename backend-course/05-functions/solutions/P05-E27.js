// P05-E27: טקסט לקוד סטטוס
function statusText(code) {
  switch (code) {
    case 200:
      return "OK";
    case 201:
      return "Created";
    case 400:
      return "Bad Request";
    case 404:
      return "Not Found";
    case 500:
      return "Internal Server Error";
    default:
      return "Unknown";
  }
}

console.log(statusText(404));
console.log(statusText(418));

module.exports = { statusText };
