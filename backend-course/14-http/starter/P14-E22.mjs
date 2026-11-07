// P14-E22: שלושה באגים. להרצה ידנית: הוסף בתחתית createCounterServer().listen(3000)
import http from "node:http";

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

export function createCounterServer() {
  const counts = {};
  return http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/count") {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const { word } = JSON.parse(raw);
      counts[word] = counts[word] + 1;
      return send(res, 200, { word, count: counts[word] });
    }
    if (req.method === "GET" && req.url.startsWith("/count/")) {
      const word = req.url.slice("/count/".length);
      return send(res, 200, { word, count: counts[word] ?? 0 });
    }
    send(res, 404, { error: "לא נמצא" });
  });
}
