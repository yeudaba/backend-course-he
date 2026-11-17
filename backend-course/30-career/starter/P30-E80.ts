// P30-E80: ‏"12 מתוך 3" — לשחזר בקוד
// כתוב וייצא:
//   type Store = { read(): Promise<number>; write(v: number): Promise<void>; decrementIfAvailable(): Promise<boolean> };
//   export function createStore(stock: number, delayMs: number): Store
//   export function naiveBuy(store: Store): Promise<boolean>
//   export function safeBuy(store: Store): Promise<boolean>
//   export function simulate(buy: (s: Store) => Promise<boolean>, stock: number, buyers: number, delayMs: number): Promise<{ sold: number; finalStock: number }>
//
// בדיקה:  npm run check P30-E80
