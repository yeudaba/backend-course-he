import rates from "./P08-E43-rates.mjs";

const SYMBOLS = { ILS: "₪", USD: "$", EUR: "€" };

export function convert(amount, from, to) {
  if (rates[from] === undefined || rates[to] === undefined) {
    return null;
  }
  return Math.round((amount * rates[from] / rates[to]) * 100) / 100;
}

export function formatMoney(amount, currency) {
  const symbol = SYMBOLS[currency];
  if (symbol === undefined) {
    return `${amount.toFixed(2)} ${currency}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}
