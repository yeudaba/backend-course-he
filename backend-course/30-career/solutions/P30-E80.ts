// P30-E80: "12 מתוך 3" — לשחזר בקוד
type Store = { read(): Promise<number>; write(v: number): Promise<void>; decrementIfAvailable(): Promise<boolean> };

export function createStore(stock: number, delayMs: number): Store {
  let current = stock;
  const wait = () => new Promise<void>((r) => setTimeout(r, delayMs));
  return {
    async read() {
      await wait();
      return current;
    },
    async write(v: number) {
      await wait();
      current = v;
    },
    async decrementIfAvailable() {
      await wait();
      if (current < 1) return false; // הבדיקה והכתיבה — באותו צעד, בלי await ביניהן
      current--;
      return true;
    },
  };
}

export async function naiveBuy(store: Store): Promise<boolean> {
  const stock = await store.read();
  if (stock < 1) return false;
  await store.write(stock - 1); // בין ה־read ל־write — כל הקונים האחרים כבר קראו
  return true;
}

export function safeBuy(store: Store): Promise<boolean> {
  return store.decrementIfAvailable();
}

export async function simulate(buy: (s: Store) => Promise<boolean>, stock: number, buyers: number, delayMs: number) {
  const store = createStore(stock, delayMs);
  const results = await Promise.all(Array.from({ length: buyers }, () => buy(store)));
  return { sold: results.filter(Boolean).length, finalStock: await store.read() };
}
