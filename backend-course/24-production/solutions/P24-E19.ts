// P24-E19
import type { Server } from "node:http";

export function gracefulShutdown(server: Server, { timeoutMs = 10_000, onClose = async () => {} }: { timeoutMs?: number; onClose?: () => Promise<void> } = {}) {
  let running: Promise<{ forced: boolean }> | undefined;
  let shuttingDown = false;

  async function shutdown() {
    shuttingDown = true;
    // 1. לא מקבלים חיבורים חדשים. close() מחכה שכל החיבורים הקיימים ייסגרו
    const closed = new Promise<void>((resolve) => server.close(() => resolve()));
    // 2. חיבורי keep-alive שלא באמצע בקשה — סוגרים עכשיו (מ־Node 19 close עושה את זה בעצמו; מפורש — ברור יותר)
    server.closeIdleConnections();
    // 3. בקשות שבאמצע — מקבלות עד timeoutMs לסיים. אחר כך — בכוח
    let timer: NodeJS.Timeout | undefined;
    const timedOut = new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(true), timeoutMs);
    });
    const forced = await Promise.race([closed.then(() => false), timedOut]);
    clearTimeout(timer);
    if (forced) {
      server.closeAllConnections();
      await closed;
    }
    // 4. רק אחרי שאין בקשות — סוגרים את מה שהן משתמשות בו (מסד, תורים)
    await onClose();
    return { forced };
  }

  return {
    // אפשר לקרוא כמה פעמים (SIGTERM ואז SIGINT) — מתבצע פעם אחת
    shutdown: () => (running ??= shutdown()),
    isShuttingDown: () => shuttingDown,
  };
}
