// P25-E15
const TYPE = /^(?<type>[a-z]+)(\((?<scope>[^)]+)\))?(?<bang>!)?: (?<subject>.+)$/;

export function nextVersion(current: string, commits: string[]): { version: string; bump: "major" | "minor" | "patch" | "none"; notes: string } {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!m) throw new Error(`גרסה לא תקינה: ${current}`);
  let [major, minor, patch] = m.slice(1).map(Number);
  const groups: Record<string, string[]> = { "⚠️ שינויים שוברים": [], "✨ חדש": [], "🐛 תיקונים": [] };
  let bump: "major" | "minor" | "patch" | "none" = "none";
  const rank = { none: 0, patch: 1, minor: 2, major: 3 };
  const raise = (b: typeof bump) => { if (rank[b] > rank[bump]) bump = b; };
  for (const message of commits) {
    const [title, ...body] = message.split("\n");
    const c = TYPE.exec(title)?.groups;
    if (!c) continue; // לא בפורמט — לא משפיע על הגרסה
    const breaking = Boolean(c.bang) || body.some((l) => l.startsWith("BREAKING CHANGE:"));
    const line = c.scope ? `${c.scope}: ${c.subject}` : c.subject;
    if (breaking) { raise("major"); groups["⚠️ שינויים שוברים"].push(line); }
    else if (c.type === "feat") { raise("minor"); groups["✨ חדש"].push(line); }
    else if (c.type === "fix") { raise("patch"); groups["🐛 תיקונים"].push(line); }
  }
  if (bump === "major") [major, minor, patch] = [major + 1, 0, 0];
  else if (bump === "minor") [minor, patch] = [minor + 1, 0];
  else if (bump === "patch") patch++;
  const version = `${major}.${minor}.${patch}`;
  const notes = Object.entries(groups)
    .filter(([, items]) => items.length)
    .map(([title, items]) => `### ${title}\n${items.map((i) => `- ${i}`).join("\n")}`)
    .join("\n\n");
  return { version, bump, notes };
}
