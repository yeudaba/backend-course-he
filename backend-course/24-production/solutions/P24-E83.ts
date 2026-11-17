// P24-E83: סדר הכיבוי
type Deps = {
  setReady(ready: boolean): void;
  closeServer(): Promise<void>;
  closeDb(): Promise<void>;
  exit(code: number): void;
  log(msg: string): void;
  timeoutMs: number;
  delay?: (ms: number) => Promise<void>;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms).unref());

export function createShutdown({ setReady, closeServer, closeDb, exit, log, timeoutMs, delay = sleep }: Deps) {
  let running: Promise<void> | undefined;
  const run = async (signal: string) => {
    log(`${signal} received`);
    setReady(false); // קודם: ה־load balancer מפסיק לשלוח
    let ok = true;
    const result = await Promise.race([closeServer().then(() => "closed"), delay(timeoutMs).then(() => "timeout")]);
    if (result === "timeout") {
      log("timeout");
      ok = false;
    }
    try {
      await closeDb(); // רק אחרי שהבקשות סיימו
    } catch {
      log("db close failed");
      ok = false;
    }
    exit(ok ? 0 : 1);
  };
  return (signal: string) => (running ??= run(signal));
}
