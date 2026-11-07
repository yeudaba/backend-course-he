// P12-E20: מתוקן
export class PriceFormatter {
  #currency: string;
  constructor(currency: string) {
    this.#currency = currency;
  }
  format = (n: number): string => `${this.#currency}${n.toFixed(2)}`;
}

const fmt = new PriceFormatter("₪");
console.log([10, 2.5].map(fmt.format), fmt.format(1));
