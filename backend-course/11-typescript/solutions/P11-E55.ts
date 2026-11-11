// P11-E55: sortBy גנרי
export function sortBy<T>(items: T[], key: (item: T) => number): T[] {
  return [...items].sort((a, b) => key(a) - key(b));
}

export function topN<T>(items: T[], key: (item: T) => number, n: number): T[] {
  return [...items].sort((a, b) => key(b) - key(a)).slice(0, n);
}

const people = [{ n: "b", age: 30 }, { n: "a", age: 20 }, { n: "c", age: 20 }];
console.log(sortBy(people, (p) => p.age).map((p) => p.n));
console.log(topN(["ccc", "a", "bb"], (s) => s.length, 2));
