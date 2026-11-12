// P24-E74: single flight — אותה פעולה, ריצה אחת
export function createSingleFlight<T>() {
  const inFlight = new Map<string, Promise<T>>();
  const done = new Map<string, T>();
  return {
    run(key: string, fn: () => Promise<T>): Promise<T> {
      if (done.has(key)) return Promise.resolve(done.get(key) as T); // replay
      const running = inFlight.get(key);
      if (running) return running; // "בטיפול" — מחכים לאותה ריצה
      const p = (async () => {
        try {
          const value = await fn();
          done.set(key, value);
          return value;
        } finally {
          inFlight.delete(key); // גם בכישלון — כדי שהבא ינסה שוב
        }
      })();
      inFlight.set(key, p);
      return p;
    },
    forget(key: string) {
      done.delete(key);
    },
  };
}
