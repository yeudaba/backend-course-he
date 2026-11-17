// P13-E50: כיבוי מסודר
export function onShutdown(proc, cleanups, log) {
  let started = false;
  let finish;
  const done = new Promise((resolve) => (finish = resolve));

  async function handler(signal) {
    if (started) return;
    started = true;
    log(`התקבל ${signal}, סוגר...`);
    let failed = false;
    for (const fn of [...cleanups].reverse()) {
      try {
        await fn();
      } catch (err) {
        log(`ניקוי נכשל: ${err.message}`);
        failed = true;
      }
    }
    proc.exitCode = failed ? 1 : 0;
    log("סיום");
    finish();
  }

  proc.on("SIGINT", () => handler("SIGINT"));
  proc.on("SIGTERM", () => handler("SIGTERM"));
  return done;
}

const handlers = {};
const fakeProc = { exitCode: undefined, on: (sig, fn) => (handlers[sig] = fn) };
const done = onShutdown(fakeProc, [
  async () => console.log("  סוגר מסד נתונים"),
  async () => { throw new Error("השרת כבר סגור"); },
  async () => console.log("  מפסיק לקבל בקשות"),
], console.log);
handlers.SIGTERM();
handlers.SIGINT();
await done;
console.log("exitCode:", fakeProc.exitCode);
