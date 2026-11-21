// P14-E85: תשובת JSON גולמית — שלוש תקלות.
// jsonResponse(status, data) ← הטקסט המלא של תשובת HTTP:
//   HTTP/1.1 <status> <text>       (text מתוך STATUS_TEXT)
//   Content-Type: application/json; charset=utf-8
//   Content-Length: <אורך הגוף בבתים>
//   (שורה ריקה)
//   <JSON.stringify(data)>
// כל שורה מסתיימת ב־\r\n. ‏204 ← רק שורת ה־status ושורה ריקה, בלי headers ובלי גוף.
//
// הרצה:   node 14-http/starter/P14-E85.mjs
// בדיקה:  npm run check P14-E85
export const STATUS_TEXT = { 200: "OK", 201: "Created", 204: "No Content", 400: "Bad Request", 404: "Not Found" };

export function jsonResponse(status, data) {
  const first = `HTTP/1.1 ${status} ${STATUS_TEXT[status]}`;
  if (status === 204) return `${first}\r\n\r\n`;
  const body = JSON.stringify(data);
  const lines = [first, "Content-Type: application/json; charset=utf-8", `Content-Length: ${body.length}`];
  return lines.join("\n") + "\r\n" + body;
}

console.log(JSON.stringify(jsonResponse(201, { id: 3, name: "מסך" })));
