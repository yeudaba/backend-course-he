// P30-E54: סעיף Skills מרשימה מבולגנת
export function skillsSection(raw: string[], groups: Record<string, string[]>, aliases: Record<string, string>): string {
  const seen = new Set<string>();
  const skills: string[] = [];
  for (const item of raw) {
    const t = item;
    if (!t) continue;
    const name = Object.hasOwn(aliases, t.toLowerCase()) ? aliases[t.toLowerCase()] : t;
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    skills.push(name);
  }
  const used = new Set<string>();
  const lines: string[] = [];
  for (const [group, members] of Object.entries(groups)) {
    const inGroup = skills.filter((s) => members.includes(s));
    inGroup.forEach((s) => used.add(s));
    if (inGroup.length) lines.push(`${group}: ${inGroup.join(", ")}`);
  }
  const other = skills.filter((s) => !used.has(s));
  if (other.length) lines.push(`Other: ${other.join(", ")}`);
  return lines.join("\n");
}
