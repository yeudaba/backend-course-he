export class PriceFormatter {
  #currency: string;
  constructor(currency: string) { this.#currency = currency; }
  format = (n: number): string => `₪${n.toFixed(2)}`;
}
