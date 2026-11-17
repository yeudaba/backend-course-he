// P26.3-E35: כמה תשיעיות?
export function availability(single: number, copies: number) {
  return 1 - (1 - single) ** copies;
}

export function nines(a: number) {
  if (a >= 1) return Infinity;
  return Math.floor(-Math.log10(1 - a) + 1e-9);
}

export function downtimeMinutesPerYear(a: number) {
  return Math.round((1 - a) * 365 * 24 * 60);
}
