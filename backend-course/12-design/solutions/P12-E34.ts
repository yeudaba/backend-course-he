// P12-E34: טווח מספרים
export class Range {
  readonly start: number;
  readonly end: number;

  constructor(start: number, end: number) {
    if (end < start) throw new RangeError("end קטן מ־start");
    this.start = start;
    this.end = end;
  }

  static parse(text: string): Range {
    const parts = text.split("-").map((p) => p.trim());
    if (parts.length !== 2 || parts[0] === "" || parts[1] === "") throw new RangeError("טווח לא תקין");
    const start = Number(parts[0]);
    const end = Number(parts[1]);
    if (Number.isNaN(start) || Number.isNaN(end)) throw new RangeError("טווח לא תקין");
    return new Range(start, end);
  }

  get length(): number {
    return this.end - this.start;
  }

  includes(n: number): boolean {
    return n >= this.start && n <= this.end;
  }

  overlaps(other: Range): boolean {
    return this.start <= other.end && other.start <= this.end;
  }

  toString(): string {
    return `[${this.start}, ${this.end}]`;
  }
}

const r = Range.parse(" 3 - 7 ");
console.log(String(r), r.length, r.includes(7), r.overlaps(new Range(7, 10)), r.overlaps(new Range(8, 9)));
