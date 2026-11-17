// P26-E113: heartbeat ל־WebSocket — ping, pong, terminate
import type { WebSocket, WebSocketServer } from "ws";

export function attachHeartbeat(wss: WebSocketServer, intervalMs: number) {
  const alive = new WeakMap<WebSocket, boolean>();
  wss.on("connection", (ws) => {
    alive.set(ws, true);
    ws.on("pong", () => alive.set(ws, true));
  });
  const timer = setInterval(() => {
    for (const ws of wss.clients) {
      if (!alive.get(ws)) {
        ws.terminate();
        continue;
      }
      alive.set(ws, false);
      ws.ping();
    }
  }, intervalMs);
  return () => clearInterval(timer);
}
