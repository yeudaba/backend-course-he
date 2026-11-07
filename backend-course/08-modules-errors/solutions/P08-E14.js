// P08-E14: המרת שגיאה לתשובת HTTP
function toHttpResponse(err) {
  if (typeof err?.status === "number" && err.status >= 400 && err.status < 500) {
    return { status: err.status, body: { error: err.message } };
  }
  if (err instanceof SyntaxError) {
    return { status: 400, body: { error: "בקשה לא תקינה" } };
  }
  return { status: 500, body: { error: "שגיאה פנימית" } };
}

const notFound = new Error("ההזמנה לא נמצאה");
notFound.status = 404;
console.log(toHttpResponse(notFound));
console.log(toHttpResponse(new TypeError("Cannot read properties of null")));

module.exports = { toHttpResponse };
