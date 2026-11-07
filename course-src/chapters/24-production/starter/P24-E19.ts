// P24-E19: כיבוי מסודר — לסיים את מה שבאמצע, ורק אז לסגור
import type { Server } from "node:http";

export function gracefulShutdown(server: Server, { timeoutMs = 10_000, onClose = async () => {} }: { timeoutMs?: number; onClose?: () => Promise<void> } = {}) {
  return {
    shutdown: async (): Promise<{ forced: boolean }> => {
      server.close(); // לא מספיק: לא מחכה, ולא סוגר חיבורי keep-alive
      await onClose();
      return { forced: false };
    },
    isShuttingDown: () => false,
  };
}
