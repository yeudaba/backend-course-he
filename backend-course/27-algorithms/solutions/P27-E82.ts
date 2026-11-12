// P27-E82: crossCheck — הפתרון המהיר מול הפשוט
export function findCounterexample<I, O>(fast: (input: I) => O, slow: (input: I) => O, generate: (rnd: () => number) => I, runs: number, seed = 1) {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  for (let r = 0; r < runs; r++) {
    const input = generate(rnd);
    const a = fast(structuredClone(input));
    const b = slow(structuredClone(input));
    if (JSON.stringify(a) !== JSON.stringify(b)) return { input, fast: a, slow: b };
  }
  return null;
}
