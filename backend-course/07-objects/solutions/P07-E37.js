const STATUS = {
  200: "OK",
  201: "Created",
  400: "Bad Request",
  404: "Not Found",
  500: "Internal Server Error",
};

function statusText(code) {
  return STATUS[code] ?? "Unknown";
}

console.log(statusText(404), statusText("201"), statusText(418));

module.exports = { statusText };
