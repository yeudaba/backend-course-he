// P12-E07
export class Temperature {
  static readonly ABSOLUTE_ZERO = -273.15;
  readonly celsius: number;

  constructor(celsius: number) {
    if (celsius < Temperature.ABSOLUTE_ZERO) {
      throw new RangeError("מתחת לאפס המוחלט");
    }
    this.celsius = celsius;
  }

  static fromFahrenheit(f: number): Temperature {
    return new Temperature(((f - 32) * 5) / 9);
  }

  get fahrenheit(): number {
    return (this.celsius * 9) / 5 + 32;
  }

  isFreezing(): boolean {
    return this.celsius <= 0;
  }

  toString(): string {
    return `${this.celsius}°C`;
  }
}

console.log(String(Temperature.fromFahrenheit(212)), new Temperature(21.5).fahrenheit);
