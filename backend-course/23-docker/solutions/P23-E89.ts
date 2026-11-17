// P23-E89: גלים של עלייה לפי depends_on
export function startupWaves(doc: any): string[][] {
  const services: Record<string, any> = doc.services ?? {};
  const names = Object.keys(services);
  const deps = (s: any): string[] => (Array.isArray(s.depends_on) ? s.depends_on : Object.keys(s.depends_on ?? {}));
  for (const name of names) {
    for (const dep of deps(services[name])) {
      if (!(dep in services)) throw new Error(`${name} תלוי ב־${dep} שלא קיים`);
    }
  }
  const done = new Set<string>();
  const waves: string[][] = [];
  while (done.size < names.length) {
    const wave = names.filter((n) => !done.has(n) && deps(services[n]).every((d) => done.has(d)));
    if (wave.length === 0) throw new Error(`מעגל תלויות: ${names.filter((n) => !done.has(n)).join(", ")}`);
    wave.forEach((n) => done.add(n));
    waves.push(wave);
  }
  return waves;
}
