// P12-E27: Money — אובייקט ערך
function withCommas(n: number): string {
  const digits = String(n);
  let out = "";
  for (let i = digits.length; i > 0; i -= 3) {
    const part = digits.slice(Math.max(0, i - 3), i);
    out = out === "" ? part : `${part},${out}`;
  }
  return out;
}

export class Money {
  readonly #agorot: number;

  private constructor(agorot: number) {
    this.#agorot = agorot;
  }

  static fromAgorot(agorot: number): Money {
    if (!Number.isInteger(agorot)) {
      throw new RangeError("סכום באגורות חייב להיות מספר שלם");
    }
    return new Money(agorot);
  }

  static fromShekels(shekels: number): Money {
    return Money.fromAgorot(Math.round(shekels * 100));
  }

  get agorot(): number {
    return this.#agorot;
  }

  plus(other: Money): Money {
    return new Money(this.#agorot + other.#agorot);
  }

  times(factor: number): Money {
    return Money.fromAgorot(Math.round(this.#agorot * factor));
  }

  equals(other: Money): boolean {
    return this.#agorot === other.#agorot;
  }

  toString(): string {
    const abs = Math.abs(this.#agorot);
    const shekels = withCommas(Math.floor(abs / 100));
    const cents = String(abs % 100).padStart(2, "0");
    return `${this.#agorot < 0 ? "-" : ""}₪${shekels}.${cents}`;
  }
}

const price = Money.fromShekels(1234.5);
console.log(String(price), String(price.times(3)), String(Money.fromAgorot(-500)));
console.log(Money.fromShekels(0.1).plus(Money.fromShekels(0.2)).equals(Money.fromAgorot(30)));
