// P28.5-E48: מי הכי רחב ב־flame graph?
export function hotFunctions(samples: string[][], top = 5) {
  const self = new Map<string, number>();
  const total = new Map<string, number>();
  for (const stack of samples) {
    for (const name of new Set(stack)) total.set(name, (total.get(name) ?? 0) + 1);
    const leaf = stack.at(-1);
    if (leaf !== undefined) self.set(leaf, (self.get(leaf) ?? 0) + 1);
  }
  const pct = (n: number) => Math.round((n / samples.length) * 1000) / 10;
  return [...total.keys()]
    .map((name) => ({ name, self: pct(self.get(name) ?? 0), total: pct(total.get(name)!) }))
    .sort((a, b) => b.self - a.self || b.total - a.total && (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .slice(0, top);
}
