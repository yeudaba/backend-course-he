// P12-E81: ממיר מטבעות — הרכבה ושגיאה משלך
export type RateSource = { rateOf(currency: string): number | undefined };

export class UnknownCurrencyError extends Error {
  readonly currency: string;
  constructor(currency: string) {
    super(`מטבע לא מוכר: ${currency}`);
    this.name = new.target.name;
    this.currency = currency;
  }
}

const round2 = (x: number): number => Math.round(x * 100) / 100;

export class Converter {
  #source: RateSource;

  constructor(source: RateSource) {
    this.#source = source;
  }

  #rate(currency: string): number {
    const rate = this.#source.rateOf(currency);
    if (rate === undefined || rate <= 0) {
      throw new UnknownCurrencyError(currency);
    }
    return rate;
  }

  toIls(amount: number, currency: string): number {
    if (currency === "ILS") return amount;
    return round2(amount * this.#rate(currency));
  }

  fromIls(amountIls: number, currency: string): number {
    if (currency === "ILS") return amountIls;
    return round2(amountIls / this.#rate(currency));
  }
}

const c = new Converter({ rateOf: (cur) => (cur === "USD" ? 3.7 : undefined) });
console.log(c.toIls(10, "USD"), c.fromIls(10, "USD"), c.toIls(5, "ILS"));
try {
  c.toIls(1, "JPY");
} catch (err) {
  if (err instanceof UnknownCurrencyError) console.log(String(err), err.currency);
}
