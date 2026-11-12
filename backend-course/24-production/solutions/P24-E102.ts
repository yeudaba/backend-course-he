// P24-E102: מפתח אחד לטופס
export function createFormSubmitter<T>({ send, newKey }: { send: (body: unknown, key: string) => Promise<T>; newKey: () => string }) {
  let key: string | null = null;
  let pending: Promise<T> | null = null;
  return {
    submit(body: unknown): Promise<T> {
      if (pending) return pending; // לחיצה כפולה — אותה שליחה
      key ??= newKey();
      const k = key;
      pending = (async () => {
        try {
          const result = await send(body, k);
          key = null; // הצליח — הפעולה הבאה תקבל מפתח חדש
          return result;
        } finally {
          pending = null;
        }
      })();
      return pending;
    },
    currentKey: () => key,
  };
}
