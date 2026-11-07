// P12-E20: prices.map(fmt.format) קורס. תקן בתוך המחלקה.
export class PriceFormatter {
  #currency: string;
  constructor(currency: string) {
    this.#currency = currency;
  }
  format(n: number): string {
    return `${this.#currency}${n.toFixed(2)}`;
  }
}
