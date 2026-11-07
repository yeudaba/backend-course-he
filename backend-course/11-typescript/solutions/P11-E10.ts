// P11-E10
export function applyToPrices(prices: number[], fn: (price: number) => number): number[] {
  return prices.map(fn);
}

export function countWhere<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

export function compose(f: (x: number) => number, g: (x: number) => number): (x: number) => number {
  return (x) => f(g(x));
}

const addVat = (p: number) => p * 1.18;
const round = (p: number) => Math.round(p);
console.log(applyToPrices([10, 20], round), countWhere(["a", "bb"], (s) => s.length > 1), compose(round, addVat)(100));
