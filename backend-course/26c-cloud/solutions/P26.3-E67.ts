// P26.3-E67: כיבוי מסודר שמתאים ל־Kubernetes
import type http from "node:http";

type Opts = { server: http.Server; drainMs: number; closeResources: () => Promise<void> };

export function createGracefulShutdown({ server, drainMs, closeResources }: Opts) {
  let ready = true;
  let running: Promise<void> | null = null;
  async function run() {
    ready = false; // /ready ← 503: Kubernetes מפסיק לשלוח אלינו
    await new Promise((r) => setTimeout(r, drainMs)); // בינתיים ממשיכים לענות לבקשות שעוד מגיעות
    await new Promise<void>((r) => server.close(() => r())); // לא מקבלים חדשות, ומחכים לאלה שבאמצע
    await closeResources(); // המסד, Redis — אחרונים
  }
  return {
    isReady: () => ready,
    shutdown() {
      running ??= run();
      return running;
    },
  };
}
