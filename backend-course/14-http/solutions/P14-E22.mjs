// P14-E22: מתוקן
import http from "node:http";

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

export function createCounterServer() {
  const counts = {};
  return http.createServer(async (req, res) => {
    try {
      if (req.method === "POST" && req.url === "/count") {
        let raw = "";
        for await (const chunk of req) raw += chunk;
        const { word } = JSON.parse(raw);
        if (typeof word !== "string" || word.trim() === "") return send(res, 400, { error: "word חובה" });
        counts[word] = (counts[word] ?? 0) + 1;
        return send(res, 200, { word, count: counts[word] });
      }
      if (req.method === "GET" && req.url.startsWith("/count/")) {
        const word = decodeURIComponent(req.url.slice("/count/".length));
        return send(res, 200, { word, count: counts[word] ?? 0 });
      }
      send(res, 404, { error: "לא נמצא" });
    } catch (err) {
      if (err instanceof SyntaxError) return send(res, 400, { error: "JSON לא תקין" });
      console.error(err);
      send(res, 500, { error: "שגיאה פנימית" });
    }
  });
}
