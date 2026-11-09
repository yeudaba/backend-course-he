// P26-E29
// חדרי צ'אט ב־WebSocket: אימות בזמן ה־upgrade, הצטרפות לחדר, ושידור לחברי החדר בלבד
import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";

export function createChatServer(server: Server, { verifyToken }: { verifyToken: (token: string) => string | null }) {
  const wss = new WebSocketServer({ noServer: true });
  const rooms = new Map<string, Set<WebSocket>>();
  const send = (ws: WebSocket, msg: object) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(msg));

  // האימות קורה לפני שהחיבור נפתח: בלי token תקין — 401 ו־socket סגור. אחרי upgrade כבר אין status codes
  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "/", "http://x");
    const user = url.pathname === "/chat" ? verifyToken(url.searchParams.get("token") ?? "") : null;
    if (!user) {
      socket.end("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      let room: string | null = null;
      const leave = () => { if (room) rooms.get(room)?.delete(ws); room = null; };
      ws.on("message", (raw) => {
        let msg: { type?: string; room?: unknown; text?: unknown };
        try { msg = JSON.parse(String(raw)); } catch { return send(ws, { type: "error", error: "invalid json" }); }
        if (msg.type === "join" && typeof msg.room === "string" && msg.room) {
          leave();
          room = msg.room;
          if (!rooms.has(room)) rooms.set(room, new Set());
          rooms.get(room)!.add(ws);
          return send(ws, { type: "joined", room });
        }
        if (msg.type === "say" && typeof msg.text === "string") {
          if (!room) return send(ws, { type: "error", error: "join a room first" });
          // השולח (user) נקבע בשרת לפי ה־token — לא לפי מה שהלקוח כותב בהודעה
          for (const peer of rooms.get(room) ?? []) send(peer, { type: "message", room, from: user, text: msg.text });
          return;
        }
        send(ws, { type: "error", error: "unknown message" });
      });
      ws.on("close", leave);
    });
  });

  return { close: () => new Promise<void>((resolve) => { for (const ws of wss.clients) ws.terminate(); wss.close(() => resolve()); }) };
}
