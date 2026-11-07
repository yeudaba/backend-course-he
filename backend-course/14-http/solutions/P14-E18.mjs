// P14-E18
import http from "node:http";

function send(res, status, body, headers = {}) {
  if (status === 204) {
    res.writeHead(204, headers);
    return res.end();
  }
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "null");
}

// מחזירה הודעת שגיאה, או null אם תקין
function validateNote(body, { partial }) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return "הגוף חייב להיות אובייקט";
  if (partial && body.text === undefined && body.done === undefined) return "צריך text או done";
  if ((!partial || body.text !== undefined) && (typeof body.text !== "string" || body.text.trim().length < 1 || body.text.trim().length > 200)) {
    return "text: מחרוזת של 1–200 תווים";
  }
  if (body.done !== undefined && typeof body.done !== "boolean") return "done: true או false";
  return null;
}

export function createNotesServer() {
  const notes = [];
  let nextId = 1;

  return http.createServer(async (req, res) => {
    const parts = new URL(req.url, "http://localhost").pathname.split("/").filter(Boolean);
    try {
      if (parts[0] !== "notes" || parts.length > 2) return send(res, 404, { error: "לא נמצא" });

      if (parts.length === 1) {
        if (req.method === "GET") return send(res, 200, notes);
        if (req.method === "POST") {
          const body = await readJson(req);
          const error = validateNote(body, { partial: false });
          if (error) return send(res, 400, { error });
          const note = { id: nextId++, text: body.text.trim(), done: false };
          notes.push(note);
          return send(res, 201, note, { Location: `/notes/${note.id}` });
        }
        return send(res, 405, { error: "Method Not Allowed" }, { Allow: "GET, POST" });
      }

      const note = notes.find((n) => n.id === Number(parts[1]));
      if (!["GET", "PATCH", "DELETE"].includes(req.method)) {
        return send(res, 405, { error: "Method Not Allowed" }, { Allow: "GET, PATCH, DELETE" });
      }
      if (!note) return send(res, 404, { error: "הפתק לא נמצא" });
      if (req.method === "GET") return send(res, 200, note);
      if (req.method === "DELETE") {
        notes.splice(notes.indexOf(note), 1);
        return send(res, 204);
      }
      const body = await readJson(req);
      const error = validateNote(body, { partial: true });
      if (error) return send(res, 400, { error });
      if (body.text !== undefined) note.text = body.text.trim();
      if (body.done !== undefined) note.done = body.done;
      return send(res, 200, note);
    } catch (err) {
      if (err instanceof SyntaxError) return send(res, 400, { error: "JSON לא תקין" });
      console.error(err);
      send(res, 500, { error: "שגיאה פנימית" });
    }
  });
}
