// P26-E29: חדרי צ'אט ב־WebSocket
import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";

export function createChatServer(server: Server, { verifyToken }: { verifyToken: (token: string) => string | null }) {
  // כתוב כאן: server.on("upgrade", ...)
  return { close: async () => {} };
}
