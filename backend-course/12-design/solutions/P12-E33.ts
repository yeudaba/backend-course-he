// P12-E33: ניקוד במשחק
export class Score {
  #points = 0;

  get points(): number {
    return this.#points;
  }

  add(n: number): void {
    if (!Number.isInteger(n) || n <= 0) {
      throw new RangeError("ניקוד חייב להיות מספר שלם חיובי");
    }
    this.#points += n;
  }

  reset(): void {
    this.#points = 0;
  }
}

const s = new Score();
s.add(10);
s.add(5);
console.log(s.points);
try {
  s.add(-3);
} catch (err) {
  console.log((err as Error).message, s.points);
}
