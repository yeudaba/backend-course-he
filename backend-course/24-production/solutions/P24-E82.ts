// P24-E82: כמה בקשות באמצע?
export function createInflight() {
  let active = 0;
  let waiters: Array<() => void> = [];
  const notify = () => {
    if (active !== 0) return;
    const list = waiters;
    waiters = [];
    for (const w of list) w();
  };
  return {
    start() {
      active++;
      let ended = false;
      return () => {
        if (ended) return; // finish וגם close — נספר פעם אחת
        ended = true;
        active--;
        notify();
      };
    },
    count: () => active,
    drained(timeoutMs: number): Promise<boolean> {
      if (active === 0) return Promise.resolve(true);
      return new Promise<boolean>((resolve) => {
        let done = false;
        const finish = (ok: boolean) => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve(ok);
        };
        const timer = setTimeout(() => finish(false), timeoutMs);
        waiters.push(() => finish(true));
      });
    },
  };
}
