// P14-E85: תשובת JSON גולמית — מתוקן
export const STATUS_TEXT = { 200: "OK", 201: "Created", 204: "No Content", 400: "Bad Request", 404: "Not Found" };

export function jsonResponse(status, data) {
  const first = `HTTP/1.1 ${status} ${STATUS_TEXT[status]}`;
  if (status === 204) return `${first}\r\n\r\n`;
  const body = JSON.stringify(data);
  const lines = [first, "Content-Type: application/json; charset=utf-8", `Content-Length: ${body.length}`];
  return lines.join("\r\n") + "\r\n\r\n" + body;
}

console.log(JSON.stringify(jsonResponse(201, { id: 3, name: "מסך" })));
