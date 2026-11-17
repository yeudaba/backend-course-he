// P28-E37: לקרוא רשימת דרישות
export function parseRequirements(text: string) {
  const functional: string[] = [];
  const nonFunctional: string[] = [];
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) return;
    const m = line.match(/^(nf|f):(.*)$/i);
    if (!m) throw new Error(`שורה ${i + 1}: חסרה קידומת F: או NF:`);
    const body = m[2].trim();
    if (!body) throw new Error(`שורה ${i + 1}: דרישה ריקה`);
    (m[1].toLowerCase() === "f" ? functional : nonFunctional).push(body);
  });
  return { functional, nonFunctional };
}
